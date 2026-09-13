import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { ensureDefaultWallets } from "@/lib/default-wallets";
import { connectDatabase } from "@/lib/mongodb";
import CryptoWallet from "@/models/CryptoWallet";
import User from "@/models/User";
import Withdrawal from "@/models/Withdrawal";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authenticatedUser =
      await getCurrentUser();

    if (
      !authenticatedUser ||
      authenticatedUser.role !== "user"
    ) {
      return NextResponse.json(
        {
          message:
            "A user account is required.",
        },
        {
          status: 403,
        }
      );
    }

    await connectDatabase();
    await ensureDefaultWallets();

    const [user, withdrawals, wallets] =
      await Promise.all([
        User.findById(
          authenticatedUser.userId
        )
          .select(
            "depositBalance profitBalance withdrawalsBlocked withdrawalBlockMessage"
          )
          .lean(),

        Withdrawal.find({
          userId:
            authenticatedUser.userId,
        })
          .sort({
            createdAt: -1,
          })
          .lean(),

        CryptoWallet.find({
          enabled: true,
        })
          .select(
            "key name symbol network sortOrder"
          )
          .sort({
            sortOrder: 1,
          })
          .lean(),
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

    const processingTotal =
      withdrawals
        .filter(
          (withdrawal) =>
            withdrawal.status ===
            "processing"
        )
        .reduce(
          (total, withdrawal) =>
            total + withdrawal.amount,
          0
        );

    const totalBalance =
      (user.depositBalance || 0) +
      (user.profitBalance || 0);

    return NextResponse.json(
      {
        withdrawals,
        wallets,
        account: {
          depositBalance:
            user.depositBalance || 0,
          profitBalance:
            user.profitBalance || 0,
          totalBalance,
          processingTotal,
          availableToWithdraw:
            Math.max(
              totalBalance -
                processingTotal,
              0
            ),
          withdrawalsBlocked:
            user.withdrawalsBlocked ||
            false,
          withdrawalBlockMessage:
            user.withdrawalBlockMessage ||
            "",
        },
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
      "Get withdrawals error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to load withdrawals.",
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
      authenticatedUser.role !== "user"
    ) {
      return NextResponse.json(
        {
          message:
            "A user account is required.",
        },
        {
          status: 403,
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

    const walletAddress = String(
      body.walletAddress || ""
    ).trim();

    if (
      !Number.isFinite(amount) ||
      amount < 1
    ) {
      return NextResponse.json(
        {
          message:
            "Enter a valid withdrawal amount of at least $1.",
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
            "Select a withdrawal asset.",
        },
        {
          status: 400,
        }
      );
    }

    if (walletAddress.length < 5) {
      return NextResponse.json(
        {
          message:
            "Enter a valid receiving wallet address.",
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

    if (user.withdrawalsBlocked) {
      return NextResponse.json(
        {
          message:
            user.withdrawalBlockMessage ||
            "Withdrawals are currently blocked for your account.",
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
            "This withdrawal method is unavailable.",
        },
        {
          status: 400,
        }
      );
    }

    const processingWithdrawals =
      await Withdrawal.find({
        userId: user._id,
        status: "processing",
      })
        .select("amount")
        .lean();

    const processingTotal =
      processingWithdrawals.reduce(
        (total, withdrawal) =>
          total + withdrawal.amount,
        0
      );

    const totalBalance =
      (user.depositBalance || 0) +
      (user.profitBalance || 0);

    const availableToWithdraw =
      totalBalance - processingTotal;

    if (amount > availableToWithdraw) {
      return NextResponse.json(
        {
          message:
            "Your available balance is too low for this withdrawal.",
        },
        {
          status: 400,
        }
      );
    }

    const withdrawal =
      await Withdrawal.create({
        userId: user._id,
        amount,
        cryptoAsset:
          selectedWallet.symbol,
        network:
          selectedWallet.network,
        walletAddress,
        status: "processing",
        adminMessage:
          "Your withdrawal request is being reviewed.",
      });

    return NextResponse.json(
      {
        message:
          "Your withdrawal request was submitted and is processing.",
        withdrawal,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Create withdrawal error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to submit your withdrawal.",
      },
      {
        status: 500,
      }
    );
  }
}