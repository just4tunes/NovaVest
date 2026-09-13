import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { connectDatabase } from "@/lib/mongodb";
import ProfitRecord from "@/models/ProfitRecord";
import Transaction from "@/models/Transaction";
import User from "@/models/User";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  context: RouteContext
) {
  const authenticatedUser = await getCurrentUser();

  if (
    !authenticatedUser ||
    authenticatedUser.role !== "admin"
  ) {
    return NextResponse.json(
      {
        message: "Administrator access required.",
      },
      {
        status: 403,
      }
    );
  }

  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      {
        message: "Invalid user ID.",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const body = await request.json();

    const amount = Number(body.amount);

    const note = String(
      body.note || "Demo investment profit"
    ).trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          message:
            "Enter a valid profit amount greater than zero.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDatabase();

    const session = await mongoose.startSession();

    let finalDepositBalance = 0;
    let finalProfitBalance = 0;
    let finalTotalBalance = 0;

    try {
      await session.withTransaction(async () => {
        const updatedUser =
          await User.findOneAndUpdate(
            {
              _id: id,
              role: "user",
              accountStatus: "active",
            },
            {
              $inc: {
                profitBalance: amount,
              },
            },
            {
              returnDocument: "after",
              session,
            }
          );

        if (!updatedUser) {
          throw new Error(
            "USER_NOT_AVAILABLE"
          );
        }

        finalDepositBalance =
          updatedUser.depositBalance || 0;

        finalProfitBalance =
          updatedUser.profitBalance || 0;

        finalTotalBalance =
          finalDepositBalance +
          finalProfitBalance;

        const createdTransactions =
          await Transaction.create(
            [
              {
                userId: updatedUser._id,
                type: "profit",
                amount,
                description: note,
                reference: `PROFIT-${randomUUID()}`,

                // This field is required by Transaction.ts
                balanceAfter: finalTotalBalance,

                createdBy:
                  authenticatedUser.userId,
              },
            ],
            {
              session,
            }
          );

        await ProfitRecord.create(
          [
            {
              userId: updatedUser._id,
              amount,
              note,
              awardedBy:
                authenticatedUser.userId,
              transactionId:
                createdTransactions[0]._id,
            },
          ],
          {
            session,
          }
        );
      });
    } finally {
      await session.endSession();
    }

    return NextResponse.json({
      message:
        "Profit awarded successfully.",
      user: {
        id,
        depositBalance:
          finalDepositBalance,
        profitBalance:
          finalProfitBalance,
        totalBalance:
          finalTotalBalance,
      },
    });
  } catch (error) {
    console.error("Award profit error:", error);

    if (
      error instanceof Error &&
      error.message === "USER_NOT_AVAILABLE"
    ) {
      return NextResponse.json(
        {
          message:
            "User does not exist or the account is suspended.",
        },
        {
          status: 404,
        }
      );
    }

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown profit error";

    return NextResponse.json(
      {
        message: "Unable to award profit.",
        error: errorMessage,
      },
      {
        status: 500,
      }
    );
  }
}