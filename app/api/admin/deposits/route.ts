import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { connectDatabase } from "@/lib/mongodb";
import Deposit from "@/models/Deposit";
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

    const deposits = await Deposit.find({})
      .populate({
        path: "userId",
        select:
          "name email accountStatus",
      })
      .sort({
        createdAt: -1,
      })
      .lean();

    return NextResponse.json(
      {
        deposits,
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
      "Get admin deposits error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to load admin deposits.",
      },
      {
        status: 500,
      }
    );
  }
}