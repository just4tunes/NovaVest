import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { connectDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const authenticatedUser = await getCurrentUser();

    if (!authenticatedUser || authenticatedUser.role !== "admin") {
      return NextResponse.json(
        {
          message: "Administrator access required.",
        },
        {
          status: 403,
        },
      );
    }

    await connectDatabase();

    const users = await User.find({
      role: "user",
    })
      .select("-password")
      .sort({
        createdAt: -1,
      })
      .lean();

    const safeUsers = users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      country: user.country || "",
      accountStatus: user.accountStatus,
      depositBalance: user.depositBalance || 0,
      profitBalance: user.profitBalance || 0,

      investmentBalance: user.investmentBalance || 0,

      totalBalance:
        (user.depositBalance || 0) +
        (user.profitBalance || 0) +
        (user.investmentBalance || 0),
      createdAt: user.createdAt,
    }));

    return NextResponse.json({
      users: safeUsers,
    });
  } catch (error) {
    console.error("Admin users error:", error);

    return NextResponse.json(
      {
        message: "Unable to load users.",
      },
      {
        status: 500,
      },
    );
  }
}
