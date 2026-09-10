import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDatabase } from "@/lib/mongodb";
import { createToken } from "@/lib/auth";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        {
          message: "Email and password are required.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDatabase();

    const user = await User.findOne({
      email,
    }).select("+password");

    if (!user) {
      return NextResponse.json(
        {
          message: "Incorrect email or password.",
        },
        {
          status: 401,
        }
      );
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          message: "Incorrect email or password.",
        },
        {
          status: 401,
        }
      );
    }

    if (user.accountStatus === "suspended") {
      return NextResponse.json(
        {
          message: "Your account has been suspended.",
        },
        {
          status: 403,
        }
      );
    }

    const token = await createToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      message: "Login successful.",
      role: user.role,
    });

    response.cookies.set("novavest_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        message: "Unable to log in.",
      },
      {
        status: 500,
      }
    );
  }
}