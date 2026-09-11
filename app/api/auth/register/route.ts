import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDatabase } from "@/lib/mongodb";
import { createToken } from "@/lib/auth";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          message: "Name, email and password are required.",
        },
        {
          status: 400,
        }
      );
    }

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

    if (!email.includes("@")) {
      return NextResponse.json(
        {
          message: "Enter a valid email address.",
        },
        {
          status: 400,
        }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          message: "Your password must contain at least 8 characters.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDatabase();

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "An account with this email already exists.",
        },
        {
          status: 409,
        }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const isAdmin =
      email === process.env.ADMIN_EMAIL?.trim().toLowerCase();

const user = await User.create({
  name,
  email,
  password: hashedPassword,
  role: isAdmin ? "admin" : "user",
  depositBalance: 0,
  profitBalance: 0,
  phone: "",
  country: "",
  accountStatus: "active",
});

    const token = await createToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        message: "Your account was created successfully.",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      {
        status: 201,
      }
    );

    response.cookies.set("novavest_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
  console.error("Registration error:", error);

  const message =
    error instanceof Error
      ? error.message
      : "Unknown registration error";

  return NextResponse.json(
    {
      message,
    },
    {
      status: 500,
    }
  );
}
}