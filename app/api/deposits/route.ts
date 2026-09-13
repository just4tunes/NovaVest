import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { ensureDefaultWallets } from "@/lib/default-wallets";
import { connectDatabase } from "@/lib/mongodb";
import CryptoWallet from "@/models/CryptoWallet";
import Deposit from "@/models/Deposit";
import User from "@/models/User";

export const dynamic = "force-dynamic";

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
    await ensureDefaultWallets();

    const databaseWallets =
      await CryptoWallet.find({
        enabled: true,
      })
        .sort({
          sortOrder: 1,
        })
        .lean();

    const wallets = Object.fromEntries(
      databaseWallets.map((wallet) => [
        wallet.key,
        {
          name: wallet.name,
          symbol: wallet.symbol,
          network: wallet.network,
          address: wallet.address,
        },
      ])
    );

    const deposits = await Deposit.find({
      userId: authenticatedUser.userId,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    return NextResponse.json(
      {
        wallets,
        deposits,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "Get deposits error:",
      error
    );

    return NextResponse.json(
      {
        message: "Unable to load deposits.",
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

    const amount = Number(body.amount);

    const walletKey = String(
      body.walletKey || ""
    )
      .trim()
      .toUpperCase();

    const transactionHash = String(
      body.transactionHash || ""
    ).trim();

    const receiptUrl = String(
      body.receiptUrl || ""
    ).trim();

    if (
      !Number.isFinite(amount) ||
      amount < 1
    ) {
      return NextResponse.json(
        {
          message:
            "Enter a valid deposit amount of at least $1.",
        },
        {
          status: 400,
        }
      );
    }

    if (!walletKey) {
      return NextResponse.json(
        {
          message:
            "Select a crypto asset.",
        },
        {
          status: 400,
        }
      );
    }

    if (!transactionHash) {
      return NextResponse.json(
        {
          message:
            "Enter the demo transaction reference.",
        },
        {
          status: 400,
        }
      );
    }

    if (!receiptUrl) {
      return NextResponse.json(
        {
          message:
            "Upload the demo payment receipt.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDatabase();
    await ensureDefaultWallets();

    const [user, selectedWallet] =
      await Promise.all([
        User.findById(
          authenticatedUser.userId
        ),

        CryptoWallet.findOne({
          key: walletKey,
          enabled: true,
        }),
      ]);

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

    if (
      user.accountStatus !== "active"
    ) {
      return NextResponse.json(
        {
          message:
            "Your account is currently suspended.",
        },
        {
          status: 403,
        }
      );
    }

    if (!selectedWallet) {
      return NextResponse.json(
        {
          message:
            "This deposit method is unavailable.",
        },
        {
          status: 400,
        }
      );
    }

    const existingReference =
      await Deposit.findOne({
        transactionHash,
      });

    if (existingReference) {
      return NextResponse.json(
        {
          message:
            "This transaction reference has already been submitted.",
        },
        {
          status: 409,
        }
      );
    }

    const deposit =
      await Deposit.create({
        userId: user._id,
        amount,
        cryptoAsset:
          selectedWallet.symbol,
        network:
          selectedWallet.network,
        walletAddress:
          selectedWallet.address,
        transactionHash,
        receiptUrl,
        status: "processing",
      });

    return NextResponse.json(
      {
        message:
          "Your demo deposit was submitted and is processing.",
        deposit,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Create deposit error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to submit your deposit.",
      },
      {
        status: 500,
      }
    );
  }
}