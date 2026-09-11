import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { connectDatabase } from "@/lib/mongodb";
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

    const user = await User.findById(authenticatedUser.userId).select(
      "-password"
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

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        country: user.country || "",
        accountStatus: user.accountStatus,
        depositBalance: user.depositBalance || 0,
        profitBalance: user.profitBalance || 0,
        totalBalance:
          (user.depositBalance || 0) +
          (user.profitBalance || 0),
        passwordChangedAt: user.passwordChangedAt || null,
        createdAt: user.createdAt,
      },
    });
 } catch (error) {
  console.error("Get profile error:", error);

  const errorMessage =
    error instanceof Error
      ? error.message
      : "Unknown profile error";

  return NextResponse.json(
    {
      message: "Unable to load your profile.",
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

    const body = await request.json();

    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const country = String(body.country || "").trim();

    if (name.length < 2) {
      return NextResponse.json(
        {
          message: "Your name must contain at least 2 characters.",
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
        new: true,
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
      message: "Your profile was updated successfully.",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        country: user.country || "",
      },
    });
} catch (error) {
  console.error("Get profile error:", error);

  const message =
    error instanceof Error
      ? error.message
      : "Unknown profile error";

  return NextResponse.json(
    {
      message: "Unable to load your profile.",
      error: message,
    },
    {
      status: 500,
    }
  );
}
}