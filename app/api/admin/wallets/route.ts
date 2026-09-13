import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { ensureDefaultWallets } from "@/lib/default-wallets";
import { connectDatabase } from "@/lib/mongodb";
import CryptoWallet from "@/models/CryptoWallet";

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
    await ensureDefaultWallets();

    const wallets = await CryptoWallet.find({})
      .sort({
        sortOrder: 1,
      })
      .lean();

    return NextResponse.json({
      wallets,
    });
  } catch (error) {
    console.error("Get admin wallets error:", error);

    return NextResponse.json(
      {
        message: "Unable to load wallet settings.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(request: Request) {
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

    const body = await request.json();

    const key = String(body.key || "")
      .trim()
      .toUpperCase();

    const network = String(body.network || "").trim();

    const address = String(body.address || "").trim();

    const enabled = Boolean(body.enabled);

    if (!key || !network || !address) {
      return NextResponse.json(
        {
          message: "Wallet key, network and address are required.",
        },
        {
          status: 400,
        },
      );
    }

    await connectDatabase();

    const wallet = await CryptoWallet.findOneAndUpdate(
      {
        key,
      },
      {
        network,
        address,
        enabled,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!wallet) {
      return NextResponse.json(
        {
          message: "Wallet was not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      message: `${wallet.symbol} wallet updated successfully.`,
      wallet,
    });
  } catch (error) {
    console.error("Update admin wallet error:", error);

    return NextResponse.json(
      {
        message: "Unable to update wallet settings.",
      },
      {
        status: 500,
      },
    );
  }
}
