"use client";

import {
  Ban,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Send,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { AppShell } from "@/components/app-shell";

type WithdrawalUser = {
  _id: string;
  name: string;
  email: string;
  depositBalance: number;
  profitBalance: number;
  withdrawalsBlocked?: boolean;
  withdrawalBlockMessage?: string;
};

type Withdrawal = {
  _id: string;
  userId: WithdrawalUser | null;
  amount: number;
  cryptoAsset: string;
  network: string;
  walletAddress: string;
  status:
    | "processing"
    | "on_the_way"
    | "blocked";
  adminMessage: string;
  profitDeducted: number;
  depositDeducted: number;
  createdAt: string;
};

type AdminAction =
  | "message"
  | "block"
  | "unblock"
  | "confirm";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatStatus(
  status: Withdrawal["status"]
) {
  if (status === "on_the_way") {
    return "Funds on the way";
  }

  if (status === "blocked") {
    return "Blocked";
  }

  return "Processing";
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] =
    useState<Withdrawal[]>([]);

  const [messages, setMessages] =
    useState<Record<string, string>>({});

  const [loading, setLoading] =
    useState(true);

  const [workingId, setWorkingId] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const loadWithdrawals = useCallback(
    async () => {
      try {
        setError("");

        const response = await fetch(
          `/api/admin/withdrawals?refresh=${Date.now()}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load withdrawals."
          );
        }

        const loadedWithdrawals =
          data.withdrawals || [];

        setWithdrawals(
          loadedWithdrawals
        );

        setMessages((current) => {
          const next = {
            ...current,
          };

          loadedWithdrawals.forEach(
            (withdrawal: Withdrawal) => {
              if (
                next[withdrawal._id] ===
                undefined
              ) {
                next[withdrawal._id] =
                  withdrawal.adminMessage ||
                  "";
              }
            }
          );

          return next;
        });
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load withdrawals."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadWithdrawals();
  }, [loadWithdrawals]);

  async function performAction(
    withdrawal: Withdrawal,
    action: AdminAction
  ) {
    const adminMessage =
      messages[withdrawal._id] || "";

    if (
      action === "message" &&
      !adminMessage.trim()
    ) {
      setError(
        "Enter a message before sending it."
      );
      return;
    }

    if (action === "confirm") {
      const confirmed = window.confirm(
        `Confirm ${formatMoney(
          withdrawal.amount
        )} withdrawal for ${
          withdrawal.userId?.name ||
          "this user"
        }? The amount will be deducted immediately.`
      );

      if (!confirmed) {
        return;
      }
    }

    if (action === "block") {
      const confirmed = window.confirm(
        `Block withdrawals for ${
          withdrawal.userId?.name ||
          "this user"
        }?`
      );

      if (!confirmed) {
        return;
      }
    }

    try {
      setWorkingId(withdrawal._id);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/withdrawals/${withdrawal._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action,
            adminMessage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update withdrawal."
        );
      }

      setSuccess(data.message);
      await loadWithdrawals();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update withdrawal."
      );
    } finally {
      setWorkingId("");
    }
  }

  const processingCount =
    withdrawals.filter(
      (withdrawal) =>
        withdrawal.status ===
        "processing"
    ).length;

  const confirmedCount =
    withdrawals.filter(
      (withdrawal) =>
        withdrawal.status ===
        "on_the_way"
    ).length;

  const blockedCount =
    withdrawals.filter(
      (withdrawal) =>
        withdrawal.status === "blocked"
    ).length;

  return (
    <AppShell mode="admin">
      <header className="dashboard-header">
        <div>
          <p>Withdrawal management</p>
          <h1>Withdrawal requests</h1>

          <span>
            Message users, block requests or
            confirm withdrawals.
          </span>
        </div>

        <div className="avatar">
          <WalletCards size={20} />
        </div>
      </header>

      {error && (
        <div className="form-message form-error">
          {error}
        </div>
      )}

      {success && (
        <div className="form-message form-success">
          {success}
        </div>
      )}

      <section className="admin-metrics">
        <article className="summary-card">
          <div className="card-icon">
            <Clock3 size={20} />
          </div>

          <strong>{processingCount}</strong>
          <span>Processing</span>
        </article>

        <article className="summary-card">
          <div className="card-icon">
            <Send size={20} />
          </div>

          <strong>{confirmedCount}</strong>
          <span>Funds on the way</span>
        </article>

        <article className="summary-card">
          <div className="card-icon">
            <Ban size={20} />
          </div>

          <strong>{blockedCount}</strong>
          <span>Blocked requests</span>
        </article>
      </section>

      <section className="dashboard-panel admin-section">
        <div className="panel-heading">
          <div>
            <span className="panel-eyebrow">
              User requests
            </span>

            <h2>Manage withdrawals</h2>
          </div>

          <button
            type="button"
            className="receipt-button"
            onClick={() =>
              void loadWithdrawals()
            }
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="dashboard-state">
            <LoaderCircle
              className="spin"
              size={28}
            />

            <p>
              Loading withdrawal requests...
            </p>
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="admin-empty-state">
            <WalletCards size={28} />

            <h3>No withdrawals yet</h3>

            <p>
              New user requests will appear
              here.
            </p>
          </div>
        ) : (
          <div className="responsive-table">
            <table className="admin-live-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Request</th>
                  <th>Receiving wallet</th>
                  <th>Status</th>
                  <th>Message and actions</th>
                </tr>
              </thead>

              <tbody>
                {withdrawals.map(
                  (withdrawal) => {
                    const userBlocked =
                      withdrawal.userId
                        ?.withdrawalsBlocked ||
                      withdrawal.status ===
                        "blocked";

                    return (
                      <tr key={withdrawal._id}>
                        <td>
                          <strong>
                            {withdrawal.userId
                              ?.name ||
                              "Deleted user"}
                          </strong>

                          <small>
                            {withdrawal.userId
                              ?.email || ""}
                          </small>

                          <small>
                            Balance:{" "}
                            {formatMoney(
                              (withdrawal.userId
                                ?.depositBalance ||
                                0) +
                                (withdrawal.userId
                                  ?.profitBalance ||
                                  0)
                            )}
                          </small>
                        </td>

                        <td>
                          <strong>
                            {formatMoney(
                              withdrawal.amount
                            )}
                          </strong>

                          <small>
                            {
                              withdrawal.cryptoAsset
                            }{" "}
                            ·{" "}
                            {withdrawal.network}
                          </small>
                        </td>

                        <td>
                          <code>
                            {
                              withdrawal.walletAddress
                            }
                          </code>
                        </td>

                        <td>
                          <span
                            className={`status ${
                              withdrawal.status ===
                              "on_the_way"
                                ? "status-active"
                                : withdrawal.status ===
                                    "blocked"
                                  ? "status-rejected"
                                  : "status-processing"
                            }`}
                          >
                            {formatStatus(
                              withdrawal.status
                            )}
                          </span>
                        </td>

                        <td>
                          <div className="profit-form">
                            <label>
                              User notification

                              <input
                                type="text"
                                placeholder="Enter a message"
                                value={
                                  messages[
                                    withdrawal
                                      ._id
                                  ] || ""
                                }
                                onChange={(
                                  event
                                ) =>
                                  setMessages(
                                    (
                                      current
                                    ) => ({
                                      ...current,
                                      [withdrawal._id]:
                                        event
                                          .target
                                          .value,
                                    })
                                  )
                                }
                              />
                            </label>

                            <button
                              type="button"
                              disabled={
                                workingId ===
                                withdrawal._id
                              }
                              onClick={() =>
                                performAction(
                                  withdrawal,
                                  "message"
                                )
                              }
                            >
                              <Send size={16} />
                              Send message
                            </button>

                            {userBlocked ? (
                              <button
                                type="button"
                                disabled={
                                  workingId ===
                                  withdrawal._id
                                }
                                onClick={() =>
                                  performAction(
                                    withdrawal,
                                    "unblock"
                                  )
                                }
                              >
                                <ShieldCheck
                                  size={16}
                                />
                                Unblock
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={
                                  workingId ===
                                  withdrawal._id ||
                                  withdrawal.status !==
                                    "processing"
                                }
                                onClick={() =>
                                  performAction(
                                    withdrawal,
                                    "block"
                                  )
                                }
                              >
                                <Ban size={16} />
                                Block
                              </button>
                            )}

                            <button
                              type="button"
                              className="approve-button"
                              disabled={
                                workingId ===
                                  withdrawal._id ||
                                withdrawal.status !==
                                  "processing" ||
                                userBlocked
                              }
                              onClick={() =>
                                performAction(
                                  withdrawal,
                                  "confirm"
                                )
                              }
                            >
                              {workingId ===
                              withdrawal._id ? (
                                <LoaderCircle
                                  className="spin"
                                  size={16}
                                />
                              ) : (
                                <CheckCircle2
                                  size={16}
                                />
                              )}

                              Confirm
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}