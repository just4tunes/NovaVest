import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { connectDatabase } from "@/lib/mongodb";
import InvestmentPlan from "@/models/InvestmentPlan";

const validRiskLevels = [
  "Low",
  "Moderate",
  "High",
] as const;

type RiskLevel =
  (typeof validRiskLevels)[number];

function createPlanKey(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readFeatures(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((feature) =>
        String(feature).trim()
      )
      .filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((feature) => feature.trim())
    .filter(Boolean);
}

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

    const plans =
      await InvestmentPlan.find()
        .sort({
          sortOrder: 1,
          createdAt: -1,
        })
        .lean();

    return NextResponse.json({
      plans,
    });
  } catch (error) {
    console.error(
      "Get investment plans error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to load investment plans.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request
) {
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

    const body = await request.json();

    const name = String(
      body.name || ""
    ).trim();

    const category = String(
      body.category || ""
    ).trim();

    const description = String(
      body.description || ""
    ).trim();

    const minimumAmount = Number(
      body.minimumAmount
    );

    const targetRate = Number(
      body.targetRate
    );

    const durationDays = Number(
      body.durationDays
    );

    const riskLevelInput = String(
      body.riskLevel || ""
    ).trim();

    const sortOrder = Number(
      body.sortOrder || 0
    );

    const features = readFeatures(
      body.features
    );

    if (name.length < 2) {
      return NextResponse.json(
        {
          message:
            "Enter a valid plan name.",
        },
        {
          status: 400,
        }
      );
    }

    if (!category) {
      return NextResponse.json(
        {
          message:
            "Enter a plan category.",
        },
        {
          status: 400,
        }
      );
    }

    if (description.length < 10) {
      return NextResponse.json(
        {
          message:
            "Enter a description of at least characters.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(minimumAmount) ||
      minimumAmount < 1
    ) {
      return NextResponse.json(
        {
          message:
            "Minimum investment must be at least $1.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(targetRate) ||
      targetRate < 0
    ) {
      return NextResponse.json(
        {
          message:
            "Enter a valid target return.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(durationDays) ||
      durationDays < 1
    ) {
      return NextResponse.json(
        {
          message:
            "Duration must be at least one day.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !validRiskLevels.includes(
        riskLevelInput as RiskLevel
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Risk level must be Low, Moderate or High.",
        },
        {
          status: 400,
        }
      );
    }

    const riskLevel =
      riskLevelInput as RiskLevel;

    await connectDatabase();

    const baseKey =
      createPlanKey(name) ||
      "investment-plan";

    let key = baseKey;
    let suffix = 1;

    while (
      await InvestmentPlan.exists({
        key,
      })
    ) {
      suffix += 1;
      key = `${baseKey}-${suffix}`;
    }

    const plan =
      await InvestmentPlan.create({
        key,
        name,
        category,
        description,
        minimumAmount,
        targetRate,
        durationDays,
        riskLevel,
        features,
        enabled:
          body.enabled === undefined
            ? true
            : Boolean(body.enabled),
        sortOrder:
          Number.isFinite(sortOrder)
            ? sortOrder
            : 0,
        createdBy:
          authenticatedUser.userId,
        updatedBy:
          authenticatedUser.userId,
      });

    return NextResponse.json(
      {
        message:
          "Investment plan created successfully.",
        plan,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Create investment plan error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to create investment plan.",
      },
      {
        status: 500,
      }
    );
  }
}