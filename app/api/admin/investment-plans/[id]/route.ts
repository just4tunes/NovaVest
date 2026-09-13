import mongoose from "mongoose";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { connectDatabase } from "@/lib/mongodb";
import Investment from "@/models/Investment";
import Transaction from "@/models/Transaction";
import User from "@/models/User";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type InvestmentAction = "projection" | "message" | "complete" | "cancel";

export async function PATCH(request: Request, context: RouteContext) {
  const authenticatedUser = await getCurrentUser();

  if (!authenticatedUser || authenticatedUser.role !== "admin") {
    return NextResponse.json(
      {
        message: "Administrator access required.",
      },
      {
        status: 403,
      },
    );
  }

  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      {
        message: "Invalid investment ID.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const body = await request.json();

    const action = String(body.action || "")
      .trim()
      .toLowerCase() as InvestmentAction;

    const adminMessage = String(body.adminMessage || "").trim();

    if (!["projection", "message", "complete", "cancel"].includes(action)) {
      return NextResponse.json(
        {
          message: "Select a valid investment action.",
        },
        {
          status: 400,
        },
      );
    }

    await connectDatabase();

    if (action === "projection") {
      const projectedReturn = Number(body.projectedReturn);

      if (!Number.isFinite(projectedReturn) || projectedReturn < 0) {
        return NextResponse.json(
          {
            message: "Enter a valid projected return.",
          },
          {
            status: 400,
          },
        );
      }

      const investment = await Investment.findOneAndUpdate(
        {
          _id: id,
          status: "active",
        },
        {
          projectedReturn,
          adminMessage:
            adminMessage ||
            "Your projected investment return has been updated.",
          projectedReturnUpdatedAt: new Date(),
          projectedReturnUpdatedBy: authenticatedUser.userId,
        },
        {
          returnDocument: "after",
          runValidators: true,
        },
      );

      if (!investment) {
        return NextResponse.json(
          {
            message: "Only an active investment can be updated.",
          },
          {
            status: 409,
          },
        );
      }

      return NextResponse.json({
        message: "Projected return updated successfully.",
        investment,
      });
    }

    if (action === "message") {
      if (!adminMessage) {
        return NextResponse.json(
          {
            message: "Enter a notification message.",
          },
          {
            status: 400,
          },
        );
      }

      const investment = await Investment.findByIdAndUpdate(
        id,
        {
          adminMessage,
        },
        {
          returnDocument: "after",
          runValidators: true,
        },
      );

      if (!investment) {
        return NextResponse.json(
          {
            message: "Investment was not found.",
          },
          {
            status: 404,
          },
        );
      }

      return NextResponse.json({
        message: "Investment notification sent.",
        investment,
      });
    }

    const session = await mongoose.startSession();

    let updatedInvestment;

    try {
      await session.withTransaction(async () => {
        const investment = await Investment.findOne({
          _id: id,
          status: "active",
          capitalReturned: {
            $ne: true,
          },
        }).session(session);

        if (!investment) {
          throw new Error("INVESTMENT_ALREADY_REVIEWED");
        }

        if (action === "cancel") {
          const updatedUser = await User.findOneAndUpdate(
            {
              _id: investment.userId,
              investmentBalance: {
                $gte: investment.amount,
              },
            },
            {
              $inc: {
                investmentBalance: -investment.amount,
                depositBalance: investment.amount,
              },
            },
            {
              returnDocument: "after",
              session,
            },
          );

          if (!updatedUser) {
            throw new Error("USER_BALANCE_ERROR");
          }

          investment.status = "cancelled";

          investment.actualProfit = 0;

          investment.adminMessage =
            adminMessage ||
            "Your investment was cancelled and the original capital was returned to your deposit balance.";

          investment.cancelledAt = new Date();

          investment.cancelledBy = new mongoose.Types.ObjectId(
            authenticatedUser.userId,
          );

          investment.capitalReturned = true;

          await investment.save({
            session,
          });

          const totalBalance =
            (updatedUser.depositBalance || 0) +
            (updatedUser.profitBalance || 0) +
            (updatedUser.investmentBalance || 0);

          await Transaction.create(
            [
              {
                userId: investment.userId,
                type: "adjustment",
                amount: investment.amount,
                description: `Investment capital returned: ${investment.planName}`,
                reference: `INV-CANCEL-${randomUUID()}`,
                balanceAfter: totalBalance,
                relatedInvestment: investment._id,
                createdBy: authenticatedUser.userId,
              },
            ],
            {
              session,
            },
          );

          updatedInvestment = investment;

          return;
        }

        const actualProfit = Number(body.actualProfit);

        if (!Number.isFinite(actualProfit) || actualProfit < 0) {
          throw new Error("INVALID_ACTUAL_PROFIT");
        }

        const updatedUser = await User.findOneAndUpdate(
          {
            _id: investment.userId,
            investmentBalance: {
              $gte: investment.amount,
            },
          },
          {
            $inc: {
              investmentBalance: -investment.amount,
              depositBalance: investment.amount,
              profitBalance: actualProfit,
            },
          },
          {
            returnDocument: "after",
            session,
          },
        );

        if (!updatedUser) {
          throw new Error("USER_BALANCE_ERROR");
        }

        investment.status = "completed";

        investment.actualProfit = actualProfit;

        investment.adminMessage =
          adminMessage ||
          `Your investment has completed. Your original capital and ${actualProfit.toLocaleString(
            "en-US",
            {
              style: "currency",
              currency: "USD",
            },
          )} profit were credited to your account.`;

        investment.completedAt = new Date();

        investment.completedBy = new mongoose.Types.ObjectId(
          authenticatedUser.userId,
        );

        investment.capitalReturned = true;

        await investment.save({
          session,
        });

        const totalBalance =
          (updatedUser.depositBalance || 0) +
          (updatedUser.profitBalance || 0) +
          (updatedUser.investmentBalance || 0);

        const transactionRecords: Array<Record<string, unknown>> = [
          {
            userId: investment.userId,
            type: "adjustment",
            amount: investment.amount,
            description: `Investment capital returned: ${investment.planName}`,
            reference: `INV-CAPITAL-${randomUUID()}`,
            balanceAfter: totalBalance,
            relatedInvestment: investment._id,
            createdBy: authenticatedUser.userId,
          },
        ];

        if (actualProfit > 0) {
          transactionRecords.push({
            userId: investment.userId,
            type: "profit",
            amount: actualProfit,
            description: `Investment profit: ${investment.planName}`,
            reference: `INV-PROFIT-${randomUUID()}`,
            balanceAfter: totalBalance,
            relatedInvestment: investment._id,
            createdBy: authenticatedUser.userId,
          });
        }

        await Transaction.create(transactionRecords, {
          session,
        });

        updatedInvestment = investment;
      });
    } finally {
      await session.endSession();
    }

    return NextResponse.json({
      message:
        action === "complete"
          ? "Investment completed and account balances updated."
          : "Investment cancelled and capital returned.",
      investment: updatedInvestment,
    });
  } catch (error) {
    console.error("Manage investment error:", error);

    if (error instanceof Error && error.message === "INVALID_ACTUAL_PROFIT") {
      return NextResponse.json(
        {
          message: "Enter a valid actual profit amount.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      error instanceof Error &&
      error.message === "INVESTMENT_ALREADY_REVIEWED"
    ) {
      return NextResponse.json(
        {
          message: "This investment has already been completed or cancelled.",
        },
        {
          status: 409,
        },
      );
    }

    if (error instanceof Error && error.message === "USER_BALANCE_ERROR") {
      return NextResponse.json(
        {
          message: "The user investment balance could not be updated safely.",
        },
        {
          status: 409,
        },
      );
    }

    return NextResponse.json(
      {
        message: "Unable to manage this investment.",
      },
      {
        status: 500,
      },
    );
  }
}
