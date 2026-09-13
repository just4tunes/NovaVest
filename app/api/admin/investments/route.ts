import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { connectDatabase } from "@/lib/mongodb";
import Investment from "@/models/Investment";

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

    const investments =
      await Investment.find()
        .populate({
          path: "userId",
          select:
            "name email depositBalance profitBalance investmentBalance accountStatus",
        })
        .populate({
          path: "projectedReturnUpdatedBy",
          select: "name email",
        })
        .populate({
          path: "completedBy",
          select: "name email",
        })
        .populate({
          path: "cancelledBy",
          select: "name email",
        })
        .sort({
          createdAt: -1,
        })
        .lean();

    const activeInvestments =
      investments.filter(
        (investment) =>
          investment.status === "active"
      );

    const completedInvestments =
      investments.filter(
        (investment) =>
          investment.status ===
          "completed"
      );

    const cancelledInvestments =
      investments.filter(
        (investment) =>
          investment.status ===
          "cancelled"
      );

    const totalInvested =
      activeInvestments.reduce(
        (total, investment) =>
          total +
          (investment.amount || 0),
        0
      );

    const totalProjectedReturns =
      activeInvestments.reduce(
        (total, investment) =>
          total +
          (investment.projectedReturn ||
            0),
        0
      );

    const totalActualProfits =
      completedInvestments.reduce(
        (total, investment) =>
          total +
          (investment.actualProfit || 0),
        0
      );

    return NextResponse.json({
      investments,
      summary: {
        totalRecords:
          investments.length,
        activeCount:
          activeInvestments.length,
        completedCount:
          completedInvestments.length,
        cancelledCount:
          cancelledInvestments.length,
        totalInvested,
        totalProjectedReturns,
        totalActualProfits,
      },
    });
  } catch (error) {
    console.error(
      "Get admin investments error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to load investments.",
      },
      {
        status: 500,
      }
    );
  }
}
