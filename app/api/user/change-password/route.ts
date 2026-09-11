import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { getCurrentUser } from "@/lib/auth";
import { connectDatabase } from "@/lib/mongodb";
import User from "@/models/User";

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

    const currentPassword = String(
      body.currentPassword || ""
    );

    const newPassword = String(
      body.newPassword || ""
    );

    const confirmPassword = String(
      body.confirmPassword || ""
    );

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return NextResponse.json(
        {
          message: "Complete all password fields.",
        },
        {
          status: 400,
        }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          message:
            "The new password must contain at least 8 characters.",
        },
        {
          status: 400,
        }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          message: "The new passwords do not match.",
        },
        {
          status: 400,
        }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          message:
            "Your new password must be different from the current password.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDatabase();

    const user = await User.findById(
      authenticatedUser.userId
    ).select("+password");

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

    const passwordIsCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordIsCorrect) {
      return NextResponse.json(
        {
          message: "Your current password is incorrect.",
        },
        {
          status: 400,
        }
      );
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.passwordChangedAt = new Date();

    await user.save();

    return NextResponse.json({
      message: "Your password was changed successfully.",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return NextResponse.json(
      {
        message: "Unable to change your password.",
      },
      {
        status: 500,
      }
    );
  }
}