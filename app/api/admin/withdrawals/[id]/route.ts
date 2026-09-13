import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { connectDatabase } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import Withdrawal from "@/models/Withdrawal";

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
          message:
            "Invalid withdrawal ID.",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json();

    const action = String(
      body.action || ""
    ).toLowerCase();

    const adminMessage = String(
      body.adminMessage || ""
    ).trim();

    if (
      ![
        "message",
        "block",
        "unblock",
        "confirm",
      ].includes(action)
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid withdrawal action.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDatabase();

    /*
     * Save a custom notification without
     * changing the withdrawal status.
     */
    if (action === "message") {
      if (!adminMessage) {
        return NextResponse.json(
          {
            message:
              "Enter a notification message.",
          },
          {
            status: 400,
          }
        );
      }

      const withdrawal =
        await Withdrawal.findByIdAndUpdate(
          id,
          {
            adminMessage,
          },
          {
            returnDocument: "after",
          }
        );

      if (!withdrawal) {
        return NextResponse.json(
          {
            message:
              "Withdrawal was not found.",
          },
          {
            status: 404,
          }
        );
      }

      return NextResponse.json({
        message:
          "Notification sent to the user.",
        withdrawal,
      });
    }

    /*
     * Block this user from making withdrawals.
     */
    if (action === "block") {
      const withdrawal =
        await Withdrawal.findById(id);

      if (!withdrawal) {
        return NextResponse.json(
          {
            message:
              "Withdrawal was not found.",
          },
          {
            status: 404,
          }
        );
      }

      const blockMessage =
        adminMessage ||
        "Withdrawals are temporarily blocked for your account. Please contact support.";

      await User.findByIdAndUpdate(
        withdrawal.userId,
        {
          withdrawalsBlocked: true,
          withdrawalBlockMessage:
            blockMessage,
        }
      );

      if (
        withdrawal.status === "processing"
      ) {
        withdrawal.status = "blocked";
        withdrawal.blockedAt =
          new Date();
      }

      withdrawal.adminMessage =
        blockMessage;

      await withdrawal.save();

      return NextResponse.json({
        message:
          "User withdrawals have been blocked.",
        withdrawal,
      });
    }

    /*
     * Allow this user to withdraw again.
     */
    if (action === "unblock") {
      const withdrawal =
        await Withdrawal.findById(id);

      if (!withdrawal) {
        return NextResponse.json(
          {
            message:
              "Withdrawal was not found.",
          },
          {
            status: 404,
          }
        );
      }

      await User.findByIdAndUpdate(
        withdrawal.userId,
        {
          withdrawalsBlocked: false,
          withdrawalBlockMessage: "",
        }
      );

      if (
        withdrawal.status === "blocked"
      ) {
        withdrawal.status =
          "processing";

        withdrawal.blockedAt =
          undefined;

        withdrawal.adminMessage =
          "Your withdrawal request is being reviewed.";
      }

      await withdrawal.save();

      return NextResponse.json({
        message:
          "User withdrawals have been enabled.",
        withdrawal,
      });
    }

    /*
     * Confirm withdrawal, deduct profit first,
     * then deduct any remainder from deposits.
     */
    const session =
      await mongoose.startSession();

    let confirmedWithdrawal;

    try {
      await session.withTransaction(
        async () => {
          const withdrawal =
            await Withdrawal.findOne({
              _id: id,
              status: "processing",
            }).session(session);

          if (!withdrawal) {
            throw new Error(
              "WITHDRAWAL_NOT_PROCESSING"
            );
          }

          const user =
            await User.findById(
              withdrawal.userId
            ).session(session);

          if (!user) {
            throw new Error(
              "USER_NOT_FOUND"
            );
          }

          if (user.withdrawalsBlocked) {
            throw new Error(
              "WITHDRAWALS_BLOCKED"
            );
          }

          const depositBalance =
            user.depositBalance || 0;

          const profitBalance =
            user.profitBalance || 0;

          const totalBalance =
            depositBalance +
            profitBalance;

          if (
            withdrawal.amount >
            totalBalance
          ) {
            throw new Error(
              "INSUFFICIENT_BALANCE"
            );
          }

          const profitDeducted =
            Math.min(
              profitBalance,
              withdrawal.amount
            );

          const depositDeducted =
            withdrawal.amount -
            profitDeducted;

          user.profitBalance =
            profitBalance -
            profitDeducted;

          user.depositBalance =
            depositBalance -
            depositDeducted;

          await user.save({
            session,
          });

          withdrawal.status =
            "on_the_way";

          withdrawal.adminMessage =
            adminMessage ||
            "Your funds are on the way.";

          withdrawal.profitDeducted =
            profitDeducted;

          withdrawal.depositDeducted =
            depositDeducted;

          withdrawal.confirmedBy =
            new mongoose.Types.ObjectId(
              authenticatedUser.userId
            );

          withdrawal.confirmedAt =
            new Date();

          await withdrawal.save({
            session,
          });

          const balanceAfter =
            user.depositBalance +
            user.profitBalance;

          await Transaction.create(
            [
              {
                userId: user._id,
                type: "withdrawal",
                amount:
                  -withdrawal.amount,
                description: `${withdrawal.cryptoAsset} withdrawal confirmed`,
                reference: `WDR-${withdrawal._id.toString()}`,
                balanceAfter,
                relatedWithdrawal:
                  withdrawal._id,
                createdBy:
                  authenticatedUser.userId,
              },
            ],
            {
              session,
            }
          );

          confirmedWithdrawal =
            withdrawal;
        }
      );
    } finally {
      await session.endSession();
    }

    return NextResponse.json({
      message:
        "Withdrawal confirmed. The user's funds are on the way.",
      withdrawal:
        confirmedWithdrawal,
    });
  } catch (error) {
    console.error(
      "Admin withdrawal action error:",
      error
    );

    if (
      error instanceof Error &&
      error.message ===
        "WITHDRAWAL_NOT_PROCESSING"
    ) {
      return NextResponse.json(
        {
          message:
            "This withdrawal is no longer processing.",
        },
        {
          status: 409,
        }
      );
    }

    if (
      error instanceof Error &&
      error.message === "USER_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          message:
            "The user was not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "WITHDRAWALS_BLOCKED"
    ) {
      return NextResponse.json(
        {
          message:
            "Unblock this user before confirming the withdrawal.",
        },
        {
          status: 409,
        }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "INSUFFICIENT_BALANCE"
    ) {
      return NextResponse.json(
        {
          message:
            "The user no longer has enough balance for this withdrawal.",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        message:
          "Unable to update withdrawal.",
      },
      {
        status: 500,
      }
    );
  }
}