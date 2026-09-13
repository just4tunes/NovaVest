import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { connectDatabase } from "@/lib/mongodb";
import User from "@/models/User";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext
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

    const { id } = await context.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return NextResponse.json(
        {
          message: "Invalid user ID.",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json();

    const accountStatus = String(
      body.accountStatus || ""
    ).toLowerCase();

    if (
      accountStatus !== "active" &&
      accountStatus !== "suspended"
    ) {
      return NextResponse.json(
        {
          message:
            "Status must be active or suspended.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDatabase();

    const user =
      await User.findOneAndUpdate(
        {
          _id: id,
          role: "user",
        },
        {
          accountStatus,
        },
        {
          returnDocument: "after",
        }
      ).select("-password");

    if (!user) {
      return NextResponse.json(
        {
          message:
            "User account was not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      message:
        accountStatus === "suspended"
          ? "User account suspended."
          : "User account reactivated.",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        accountStatus:
          user.accountStatus,
      },
    });
  } catch (error) {
    console.error(
      "Update user status error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to update user status.",
      },
      {
        status: 500,
      }
    );
  }
}