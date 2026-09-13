import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { connectDatabase } from "@/lib/mongodb";
import Withdrawal from "@/models/Withdrawal";
import "@/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
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

    await connectDatabase();

    const withdrawals =
      await Withdrawal.find({})
        .populate({
          path: "userId",
          select:
            "name email depositBalance profitBalance withdrawalsBlocked withdrawalBlockMessage",
        })
        .populate({
          path: "confirmedBy",
          select: "name email",
        })
        .sort({
          createdAt: -1,
        })
        .lean();

    return NextResponse.json(
      {
        withdrawals,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "Get admin withdrawals error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to load withdrawal requests.",
      },
      {
        status: 500,
      }
    );
  }
}