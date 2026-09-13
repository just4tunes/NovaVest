import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { connectDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const authenticatedUser =
      await getCurrentUser();

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
    ).select("-password");

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

    const depositBalance =
      user.depositBalance || 0;

    const profitBalance =
      user.profitBalance || 0;

    const investmentBalance =
      user.investmentBalance || 0;

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        country: user.country || "",
        accountStatus: user.accountStatus,
        depositBalance,
        profitBalance,
        investmentBalance,
        availableBalance:
          depositBalance + profitBalance,
        totalBalance:
          depositBalance +
          profitBalance +
          investmentBalance,
        withdrawalsBlocked:
          user.withdrawalsBlocked || false,
        withdrawalBlockMessage:
          user.withdrawalBlockMessage || "",
        passwordChangedAt:
          user.passwordChangedAt || null,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Get profile error:",
      error
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown profile error";

    return NextResponse.json(
      {
        message:
          "Unable to load your profile.",
        error: errorMessage,
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const authenticatedUser =
      await getCurrentUser();

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

    const body = await request.json();

    const name = String(
      body.name || ""
    ).trim();

    const phone = String(
      body.phone || ""
    ).trim();

    const country = String(
      body.country || ""
    ).trim();

    if (name.length < 2) {
      return NextResponse.json(
        {
          message:
            "Your name must contain at least 2 characters.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDatabase();

    const user = await User.findByIdAndUpdate(
      authenticatedUser.userId,
      {
        name,
        phone,
        country,
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    ).select("-password");

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

    return NextResponse.json({
      message:
        "Your profile was updated successfully.",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        country: user.country || "",
      },
    });
  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown profile error";

    return NextResponse.json(
      {
        message:
          "Unable to update your profile.",
        error: errorMessage,
      },
      {
        status: 500,
      }
    );
  }
}