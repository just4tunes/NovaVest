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

type InvestmentAction =
  | "projection"
  | "message"
  | "complete"
  | "cancel";

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  const authenticatedUser =
    await getCurrentUser();

  if (
    !authenticatedUser ||
    authenticatedUser.role !== "admin"
  ) {
    return NextResponse.json(
      {
        message:
          "Administrator access required.",
      },
      {
        status: 403,
      }
    );
  }

  const { id } = await context.params;

  if (
    !mongoose.Types.ObjectId.isValid(id)
  ) {
    return NextResponse.json(
      {
        message:
          "Invalid investment ID.",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const body = await request.json();

    const actionInput = String(
      body.action || ""
    )
      .trim()
      .toLowerCase();

    const validActions = [
      "projection",
      "message",
      "complete",
      "cancel",
    ] as const;

    if (
      !validActions.includes(
        actionInput as InvestmentAction
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Select a valid investment action.",
        },
        {
          status: 400,
        }
      );
    }

    const action =
      actionInput as InvestmentAction;

    const adminMessage = String(
      body.adminMessage || ""
    ).trim();

    await connectDatabase();

    if (action === "projection") {
      const projectedReturn = Number(
        body.projectedReturn
      );

      if (
        !Number.isFinite(
          projectedReturn
        ) ||
        projectedReturn < 0
      ) {
        return NextResponse.json(
          {
            message:
              "Enter a valid projected return.",
          },
          {
            status: 400,
          }
        );
      }

      const investment =
        await Investment.findOneAndUpdate(
          {
            _id: id,
            status: "active",
          },
          {
            projectedReturn,
            adminMessage:
              adminMessage ||
              "Your projected investment return has been updated.",
            projectedReturnUpdatedAt:
              new Date(),
            projectedReturnUpdatedBy:
              authenticatedUser.userId,
          },
          {
            returnDocument: "after",
            runValidators: true,
          }
        );

      if (!investment) {
        return NextResponse.json(
          {
            message:
              "Only an active investment can be updated.",
          },
          {
            status: 409,
          }
        );
      }

      return NextResponse.json({
        message:
          "Projected return updated successfully.",
        investment,
      });
    }

    if (action === "message") {
      if (!adminMessage) {
        return NextResponse.json(
          {
            message:
              "Enter a notification message.",
          },
          {
            status: 400,
          }
        );
      }

      const investment =
        await Investment.findByIdAndUpdate(
          id,
          {
            adminMessage,
          },
          {
            returnDocument: "after",
            runValidators: true,
          }
        );

      if (!investment) {
        return NextResponse.json(
          {
            message:
              "Investment was not found.",
          },
          {
            status: 404,
          }
        );
      }

      return NextResponse.json({
        message:
          "Investment notification sent.",
        investment,
      });
    }

    let actualProfit = 0;

    if (action === "complete") {
      actualProfit = Number(
        body.actualProfit
      );

      if (
        !Number.isFinite(actualProfit) ||
        actualProfit < 0
      ) {
        return NextResponse.json(
          {
            message:
              "Enter a valid actual profit amount.",
          },
          {
            status: 400,
          }
        );
      }
    }

    const session =
      await mongoose.startSession();

    try {
      await session.withTransaction(
        async () => {
          const investment =
            await Investment.findOne({
              _id: id,
              status: "active",
              capitalReturned: {
                $ne: true,
              },
            }).session(session);

          if (!investment) {
            throw new Error(
              "INVESTMENT_ALREADY_REVIEWED"
            );
          }

          const profitToCredit =
            action === "complete"
              ? actualProfit
              : 0;

          const updatedUser =
            await User.findOneAndUpdate(
              {
                _id: investment.userId,
                investmentBalance: {
                  $gte:
                    investment.amount,
                },
              },
              {
                $inc: {
                  investmentBalance:
                    -investment.amount,
                  depositBalance:
                    investment.amount,
                  profitBalance:
                    profitToCredit,
                },
              },
              {
                returnDocument: "after",
                session,
              }
            );

          if (!updatedUser) {
            throw new Error(
              "USER_BALANCE_ERROR"
            );
          }

          const now = new Date();

          if (action === "complete") {
            investment.status =
              "completed";

            investment.actualProfit =
              actualProfit;

            investment.completedAt = now;

            investment.completedBy =
              new mongoose.Types.ObjectId(
                authenticatedUser.userId
              );

            investment.adminMessage =
              adminMessage ||
              "Your investment has completed. Your original capital and actual profit were credited to your account.";
          } else {
            investment.status =
              "cancelled";

            investment.actualProfit = 0;

            investment.cancelledAt = now;

            investment.cancelledBy =
              new mongoose.Types.ObjectId(
                authenticatedUser.userId
              );

            investment.adminMessage =
              adminMessage ||
              "Your investment was cancelled and your original capital was returned to your deposit balance.";
          }

          investment.capitalReturned =
            true;

          await investment.save({
            session,
          });

          const totalBalance =
            (updatedUser.depositBalance ||
              0) +
            (updatedUser.profitBalance ||
              0) +
            (updatedUser.investmentBalance ||
              0);

          await Transaction.create(
            [
              {
                userId:
                  investment.userId,
                type: "adjustment",
                amount:
                  investment.amount,
                description:
                  action === "complete"
                    ? `Investment capital returned: ${investment.planName}`
                    : `Cancelled investment capital returned: ${investment.planName}`,
                reference:
                  action === "complete"
                    ? `INV-CAPITAL-${randomUUID()}`
                    : `INV-CANCEL-${randomUUID()}`,
                balanceAfter:
                  totalBalance,
                relatedInvestment:
                  investment._id,
                createdBy:
                  authenticatedUser.userId,
              },
            ],
            {
              session,
            }
          );

          if (
            action === "complete" &&
            actualProfit > 0
          ) {
            await Transaction.create(
              [
                {
                  userId:
                    investment.userId,
                  type: "profit",
                  amount:
                    actualProfit,
                  description: `Investment profit: ${investment.planName}`,
                  reference: `INV-PROFIT-${randomUUID()}`,
                  balanceAfter:
                    totalBalance,
                  relatedInvestment:
                    investment._id,
                  createdBy:
                    authenticatedUser.userId,
                },
              ],
              {
                session,
              }
            );
          }
        }
      );
    } finally {
      await session.endSession();
    }

    const updatedInvestment =
      await Investment.findById(id);

    return NextResponse.json({
      message:
        action === "complete"
          ? "Investment completed and account balances updated."
          : "Investment cancelled and capital returned.",
      investment:
        updatedInvestment,
    });
  } catch (error) {
    console.error(
      "Manage investment error:",
      error
    );

    if (
      error instanceof Error &&
      error.message ===
        "INVESTMENT_ALREADY_REVIEWED"
    ) {
      return NextResponse.json(
        {
          message:
            "This investment has already been completed or cancelled.",
        },
        {
          status: 409,
        }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "USER_BALANCE_ERROR"
    ) {
      return NextResponse.json(
        {
          message:
            "The user investment balance could not be updated safely.",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        message:
          "Unable to update this investment.",
      },
      {
        status: 500,
      }
    );
  }
}