import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { connectDatabase } from "@/lib/mongodb";
import Deposit from "@/models/Deposit";
import Transaction from "@/models/Transaction";

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

    const [transactions, deposits] =
      await Promise.all([
        Transaction.find({
          userId: authenticatedUser.userId,
        })
          .sort({
            createdAt: -1,
          })
          .lean(),

        Deposit.find({
          userId: authenticatedUser.userId,
        })
          .sort({
            createdAt: -1,
          })
          .lean(),
      ]);

    return NextResponse.json({
      transactions,
      deposits,
    });
  } catch (error) {
    console.error(
      "Get transaction history error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to load transaction history.",
      },
      {
        status: 500,
      }
    );
  }
}