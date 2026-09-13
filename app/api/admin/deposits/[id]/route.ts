import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { connectDatabase } from "@/lib/mongodb";
import Deposit from "@/models/Deposit";
import Transaction from "@/models/Transaction";
import User from "@/models/User";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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
        message: "Invalid deposit ID.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const body = await request.json();

    const action = String(body.action || "").toLowerCase();

    const adminNote = String(body.adminNote || "").trim();

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        {
          message: "Action must be approve or reject.",
        },
        {
          status: 400,
        },
      );
    }

    await connectDatabase();

    if (action === "reject") {
      const rejectedDeposit = await Deposit.findOneAndUpdate(
        {
          _id: id,
          status: "processing",
        },
        {
          status: "rejected",
          adminNote,
          approvedBy: authenticatedUser.userId,
          rejectedAt: new Date(),
        },
        {
          new: true,
        },
      );

      if (!rejectedDeposit) {
        return NextResponse.json(
          {
            message:
              "This deposit has already been reviewed or does not exist.",
          },
          {
            status: 409,
          },
        );
      }

      return NextResponse.json({
        message: "Deposit rejected.",
        deposit: rejectedDeposit,
      });
    }

    const session = await mongoose.startSession();

    let approvedDeposit;

    try {
      await session.withTransaction(async () => {
        approvedDeposit = await Deposit.findOneAndUpdate(
          {
            _id: id,
            status: "processing",
          },
          {
            status: "approved",
            adminNote,
            approvedBy: authenticatedUser.userId,
            approvedAt: new Date(),
          },
          {
            new: true,
            session,
          },
        );

        if (!approvedDeposit) {
          throw new Error("DEPOSIT_ALREADY_REVIEWED");
        }

        const updatedUser = await User.findByIdAndUpdate(
          approvedDeposit.userId,
          {
            $inc: {
              depositBalance: approvedDeposit.amount,
            },
          },
          {
            new: true,
            session,
          },
        );

        if (!updatedUser) {
          throw new Error("USER_NOT_FOUND");
        }

        await Transaction.create(
          [
            {
              userId: approvedDeposit.userId,
              type: "deposit",
              amount: approvedDeposit.amount,
              description: `${approvedDeposit.cryptoAsset} deposit approved`,
              reference: `DEP-${approvedDeposit._id.toString()}`,
              balanceAfter:
                (updatedUser.depositBalance || 0) +
                (updatedUser.profitBalance || 0),
              relatedDeposit: approvedDeposit._id,
              createdBy: authenticatedUser.userId,
            },
          ],
          {
            session,
          },
        );
      });
    } finally {
      await session.endSession();
    }

    return NextResponse.json({
      message: "Deposit approved and user balance credited automatically.",
      deposit: approvedDeposit,
    });
  } catch (error) {
    console.error("Review deposit error:", error);

    if (
      error instanceof Error &&
      error.message === "DEPOSIT_ALREADY_REVIEWED"
    ) {
      return NextResponse.json(
        {
          message: "This deposit has already been reviewed.",
        },
        {
          status: 409,
        },
      );
    }

    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return NextResponse.json(
        {
          message: "The user belonging to this deposit was not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        message: "Unable to review deposit.",
      },
      {
        status: 500,
      },
    )
  }
}
