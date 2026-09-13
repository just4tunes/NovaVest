import mongoose from "mongoose";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { connectDatabase } from "@/lib/mongodb";
import Investment from "@/models/Investment";
import InvestmentPlan from "@/models/InvestmentPlan";
import Transaction from "@/models/Transaction";
import User from "@/models/User";

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

    const [user, plans, investments] =
      await Promise.all([
        User.findById(
          authenticatedUser.userId
        )
          .select(
            "depositBalance profitBalance investmentBalance accountStatus"
          )
          .lean(),

        InvestmentPlan.find({
          enabled: true,
        })
          .sort({
            sortOrder: 1,
            createdAt: -1,
          })
          .lean(),

        Investment.find({
          userId:
            authenticatedUser.userId,
        })
          .sort({
            createdAt: -1,
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

    const depositBalance =
      user.depositBalance || 0;

    const profitBalance =
      user.profitBalance || 0;

    const investmentBalance =
      user.investmentBalance || 0;

    return NextResponse.json({
      plans,
      investments,
      account: {
        depositBalance,
        profitBalance,
        investmentBalance,
        availableToInvest:
          depositBalance,
        totalBalance:
          depositBalance +
          profitBalance +
          investmentBalance,
      },
    });
  } catch (error) {
    console.error(
      "Get investments error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to load investments.",
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

  try {
    const body = await request.json();

    const planKey = String(
      body.planKey || ""
    )
      .trim()
      .toLowerCase();

    const amount = Number(
      body.amount
    );

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "Enter a valid investment amount.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDatabase();

    const selectedPlan =
      await InvestmentPlan.findOne({
        key: planKey,
        enabled: true,
      }).lean();

    if (!selectedPlan) {
      return NextResponse.json(
        {
          message:
            "This investment plan is unavailable.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      amount <
      selectedPlan.minimumAmount
    ) {
      return NextResponse.json(
        {
          message: `The minimum amount for ${selectedPlan.name} is $${selectedPlan.minimumAmount.toLocaleString()}.`,
        },
        {
          status: 400,
        }
      );
    }

    const session =
      await mongoose.startSession();

    let createdInvestment;

    try {
      await session.withTransaction(
        async () => {
          const updatedUser =
            await User.findOneAndUpdate(
              {
                _id:
                  authenticatedUser.userId,
                accountStatus: "active",
                depositBalance: {
                  $gte: amount,
                },
              },
              {
                $inc: {
                  depositBalance: -amount,
                  investmentBalance:
                    amount,
                },
              },
              {
                returnDocument: "after",
                session,
              }
            );

          if (!updatedUser) {
            const existingUser =
              await User.findById(
                authenticatedUser.userId
              ).session(session);

            if (!existingUser) {
              throw new Error(
                "USER_NOT_FOUND"
              );
            }

            if (
              existingUser.accountStatus !==
              "active"
            ) {
              throw new Error(
                "ACCOUNT_SUSPENDED"
              );
            }

            throw new Error(
              "INSUFFICIENT_BALANCE"
            );
          }

          const startedAt =
            new Date();

          const maturesAt =
            new Date(startedAt);

          maturesAt.setDate(
            maturesAt.getDate() +
              selectedPlan.durationDays
          );

          const createdRecords =
            await Investment.create(
              [
                {
                  userId:
                    authenticatedUser.userId,
                  planKey:
                    selectedPlan.key,
                  planName:
                    selectedPlan.name,
                  category:
                    selectedPlan.category,
                  amount,
                  targetRate:
                    selectedPlan.targetRate,

                  /*
                   * The administrator will
                   * enter this manually.
                   */
                  projectedReturn: 0,

                  durationDays:
                    selectedPlan.durationDays,
                  riskLevel:
                    selectedPlan.riskLevel,
                  status: "active",
                  startedAt,
                  maturesAt,
                },
              ],
              {
                session,
              }
            );

          createdInvestment =
            createdRecords[0];

          const totalBalance =
            (updatedUser.depositBalance ||
              0) +
            (updatedUser.profitBalance ||
              0) +
            (updatedUser.investmentBalance ||
              0);

          await Transaction.create(
            [
              {
                userId:
                  authenticatedUser.userId,
                type: "investment",
                amount: -amount,
                description: `Investment started: ${selectedPlan.name}`,
                reference: `INV-${randomUUID()}`,
                balanceAfter:
                  totalBalance,
                relatedInvestment:
                  createdInvestment._id,
              },
            ],
            {
              session,
            }
          );
        }
      );
    } finally {
      await session.endSession();
    }

    return NextResponse.json(
      {
        message: `Your simulated ${selectedPlan.name} investment has started.`,
        investment:
          createdInvestment,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Create investment error:",
      error
    );

    if (
      error instanceof Error &&
      error.message ===
        "INSUFFICIENT_BALANCE"
    ) {
      return NextResponse.json(
        {
          message:
            "Your deposit balance is not enough for this investment.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "ACCOUNT_SUSPENDED"
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

    if (
      error instanceof Error &&
      error.message ===
        "USER_NOT_FOUND"
    ) {
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

    return NextResponse.json(
      {
        message:
          "Unable to start this investment.",
      },
      {
        status: 500,
      }
    );
  }
}