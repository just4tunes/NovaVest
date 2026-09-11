import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { connectDatabase } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import User from "@/models/User";

export async function GET() {
  try {
    const authenticatedUser = await getCurrentUser();

    if (!authenticatedUser) {
      return NextResponse.json(
        {
          message: "You must be signed in.",
        },
        {
          status: 401,
        }
      );
    }

    await connectDatabase();

    const user = await User.findById(
      authenticatedUser.userId
    ).select(
      "depositBalance profitBalance"
    );

    if (!user) {
      return NextResponse.json(
        {
          message: "User account was not found.",
        },
        {
          status: 404,
        }
      );
    }

    const transactions = await Transaction.find({
      userId: authenticatedUser.userId,
    })
      .sort({
        createdAt: 1,
      })
      .select("type amount createdAt")
      .lean();

    let cumulativeDeposits = 0;
    let cumulativeProfits = 0;

    const chartData = transactions.map(
      (transaction) => {
        if (transaction.type === "deposit") {
          cumulativeDeposits += transaction.amount;
        }

        if (transaction.type === "profit") {
          cumulativeProfits += transaction.amount;
        }

        return {
          date: transaction.createdAt,
          deposits: cumulativeDeposits,
          profits: cumulativeProfits,
          total:
            cumulativeDeposits +
            cumulativeProfits,
        };
      }
    );

    return NextResponse.json({
      summary: {
        depositBalance:
          user.depositBalance || 0,
        profitBalance:
          user.profitBalance || 0,
        totalBalance:
          (user.depositBalance || 0) +
          (user.profitBalance || 0),
      },
      chartData,
    });
  } catch (error) {
    console.error(
      "Get performance error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to load performance information.",
      },
      {
        status: 500,
      }
    );
  }
}