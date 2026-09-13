"use client";

import {
  Ban,
  CheckCircle2,
  Clock3,
  DollarSign,
  Edit3,
  LoaderCircle,
  MessageSquare,
  RefreshCw,
  Search,
  TrendingUp,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type InvestmentStatus =
  | "active"
  | "completed"
  | "cancelled";

type InvestmentUser = {
  _id: string;
  name: string;
  email: string;
  depositBalance: number;
  profitBalance: number;
  investmentBalance: number;
  accountStatus: string;
};

type Investment = {
  _id: string;
  userId: InvestmentUser | null;
  planKey: string;
  planName: string;
  category: string;
  amount: number;
  targetRate: number;
  projectedReturn: number;
  actualProfit: number;
  durationDays: number;
  riskLevel: string;
  status: InvestmentStatus;
  adminMessage: string;
  startedAt: string;
  maturesAt: string;
  completedAt?: string | null;
  cancelledAt?: string | null;
  capitalReturned: boolean;
  createdAt: string;
  updatedAt: string;
};

type InvestmentSummary = {
  totalRecords: number;
  activeCount: number;
  completedCount: number;
  cancelledCount: number;
  totalInvested: number;
  totalProjectedReturns: number;
  totalActualProfits: number;
};

const emptySummary: InvestmentSummary = {
  totalRecords: 0,
  activeCount: 0,
  completedCount: 0,
  cancelledCount: 0,
  totalInvested: 0,
  totalProjectedReturns: 0,
  totalActualProfits: 0,
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount || 0);
}

function formatDate(date?: string | null) {
  if (!date) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(date));
}

export function AdminInvestments() {
  const [investments, setInvestments] =
    useState<Investment[]>([]);

  const [summary, setSummary] =
    useState<InvestmentSummary>(
      emptySummary
    );

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"all" | InvestmentStatus>(
      "all"
    );

  const [loading, setLoading] =
    useState(true);

  const [workingId, setWorkingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const loadInvestments =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/admin/investments?refresh=${Date.now()}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load investments."
          );
        }

        setInvestments(
          data.investments || []
        );

        setSummary(
          data.summary || emptySummary
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load investments."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadInvestments();
  }, [loadInvestments]);

  const filteredInvestments =
    useMemo(() => {
      const searchValue =
        search.trim().toLowerCase();

      return investments.filter(
        (investment) => {
          if (
            statusFilter !== "all" &&
            investment.status !==
              statusFilter
          ) {
            return false;
          }

          if (!searchValue) {
            return true;
          }

          const searchableText = [
            investment.planName,
            investment.category,
            investment.userId?.name,
            investment.userId?.email,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            searchValue
          );
        }
      );
    }, [
      investments,
      search,
      statusFilter,
    ]);

  async function performAction(
    investment: Investment,
    body: Record<string, unknown>
  ) {
    try {
      setWorkingId(investment._id);
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/admin/investments/${investment._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update investment."
        );
      }

      setMessage(data.message);

      await loadInvestments();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Unable to update investment."
      );
    } finally {
      setWorkingId(null);
    }
  }

  function updateProjection(
    investment: Investment
  ) {
    const returnInput =
      window.prompt(
        `Enter the projected return for ${investment.planName}:`,
        String(
          investment.projectedReturn || ""
        )
      );

    if (returnInput === null) {
      return;
    }

    const projectedReturn =
      Number(returnInput);

    if (
      !Number.isFinite(
        projectedReturn
      ) ||
      projectedReturn < 0
    ) {
      setError(
        "Enter a valid projected return."
      );

      return;
    }

    const adminMessage =
      window.prompt(
        "Enter the message shown to the user:",
        "Your projected investment return has been updated."
      );

    if (adminMessage === null) {
      return;
    }

    void performAction(investment, {
      action: "projection",
      projectedReturn,
      adminMessage,
    });
  }

  function sendMessage(
    investment: Investment
  ) {
    const adminMessage =
      window.prompt(
        "Enter the notification message for this user:",
        investment.adminMessage || ""
      );

    if (
      adminMessage === null ||
      !adminMessage.trim()
    ) {
      return;
    }

    void performAction(investment, {
      action: "message",
      adminMessage,
    });
  }

  function completeInvestment(
    investment: Investment
  ) {
    const profitInput =
      window.prompt(
        `Enter the actual profit for ${investment.planName}:`,
        String(
          investment.projectedReturn || 0
        )
      );

    if (profitInput === null) {
      return;
    }

    const actualProfit =
      Number(profitInput);

    if (
      !Number.isFinite(actualProfit) ||
      actualProfit < 0
    ) {
      setError(
        "Enter a valid actual profit."
      );

      return;
    }

    const adminMessage =
      window.prompt(
        "Enter the completion message:",
        "Your investment has completed. Your capital and profit have been credited to your account."
      );

    if (adminMessage === null) {
      return;
    }

    const confirmed =
      window.confirm(
        `Complete this investment and credit ${formatMoney(
          actualProfit
        )} as actual profit?`
      );

    if (!confirmed) {
      return;
    }

    void performAction(investment, {
      action: "complete",
      actualProfit,
      adminMessage,
    });
  }

  function cancelInvestment(
    investment: Investment
  ) {
    const adminMessage =
      window.prompt(
        "Enter the cancellation reason:",
        "Your investment was cancelled and your original capital was returned."
      );

    if (adminMessage === null) {
      return;
    }

    const confirmed =
      window.confirm(
        `Cancel this investment and return ${formatMoney(
          investment.amount
        )} to the user's deposit balance?`
      );

    if (!confirmed) {
      return;
    }

    void performAction(investment, {
      action: "cancel",
      adminMessage,
    });
  }

  return (
    <>
      {error && (
        <div className="form-message form-error">
          {error}
        </div>
      )}

      {message && (
        <div className="form-message form-success">
          {message}
        </div>
      )}

      <section className="admin-metrics">
        <article className="summary-card">
          <div className="card-icon">
            <Clock3 size={20} />
          </div>

          <strong>
            {summary.activeCount}
          </strong>

          <span>
            Active investments
          </span>
        </article>

        <article className="summary-card">
          <div className="card-icon">
            <DollarSign size={20} />
          </div>

          <strong>
            {formatMoney(
              summary.totalInvested
            )}
          </strong>

          <span>
            Currently invested
          </span>
        </article>

        <article className="summary-card">
          <div className="card-icon">
            <TrendingUp size={20} />
          </div>

          <strong>
            {formatMoney(
              summary.totalProjectedReturns
            )}
          </strong>

          <span>
            Projected returns
          </span>
        </article>

        <article className="summary-card">
          <div className="card-icon">
            <CheckCircle2 size={20} />
          </div>

          <strong>
            {summary.completedCount}
          </strong>

          <span>
            Completed investments
          </span>
        </article>
      </section>

      <section className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <span className="panel-eyebrow">
              User portfolios
            </span>

            <h2>
              Investment records
            </h2>

            <p>
              {filteredInvestments.length}{" "}
              matching{" "}
              {filteredInvestments.length ===
              1
                ? "record"
                : "records"}
            </p>
          </div>

          <button
            type="button"
            className="receipt-button"
            onClick={() =>
              void loadInvestments()
            }
            disabled={loading}
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        <div className="admin-investment-filters">
          <label>
            <Search size={17} />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search user or plan"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | "all"
                  | InvestmentStatus
              )
            }
          >
            <option value="all">
              All statuses
            </option>

            <option value="active">
              Active
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>
        </div>

        {loading ? (
          <div className="dashboard-state">
            <LoaderCircle
              className="spin"
              size={28}
            />

            <p>
              Loading investments...
            </p>
          </div>
        ) : filteredInvestments.length ===
          0 ? (
          <div className="admin-empty-state">
            <TrendingUp size={28} />

            <h3>
              No investment records
            </h3>

            <p>
              User investments will
              appear here.
            </p>
          </div>
        ) : (
          <div className="responsive-table">
            <table className="admin-live-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Plan</th>
                  <th>Investment</th>
                  <th>Returns</th>
                  <th>Timeline</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredInvestments.map(
                  (investment) => (
                    <tr
                      key={
                        investment._id
                      }
                    >
                      <td>
                        <div className="admin-user-cell">
                          <span className="small-avatar">
                            {investment.userId
                              ?.name
                              ?.slice(0, 1)
                              .toUpperCase() ||
                              "U"}
                          </span>

                          <div>
                            <strong>
                              {investment.userId
                                ?.name ||
                                "Deleted user"}
                            </strong>

                            <span>
                              {investment.userId
                                ?.email ||
                                "No email"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <strong>
                          {
                            investment.planName
                          }
                        </strong>

                        <span>
                          {
                            investment.category
                          }
                          {" · "}
                          {
                            investment.riskLevel
                          }
                        </span>
                      </td>

                      <td>
                        <strong>
                          {formatMoney(
                            investment.amount
                          )}
                        </strong>

                        <span>
                          Target{" "}
                          {
                            investment.targetRate
                          }
                          %
                        </span>
                      </td>

                      <td>
                        <strong>
                          Projected:{" "}
                          {formatMoney(
                            investment.projectedReturn
                          )}
                        </strong>

                        <span>
                          Actual:{" "}
                          {formatMoney(
                            investment.actualProfit
                          )}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {formatDate(
                            investment.startedAt
                          )}
                        </strong>

                        <span>
                          Matures{" "}
                          {formatDate(
                            investment.maturesAt
                          )}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`investment-status investment-status-${investment.status}`}
                        >
                          {
                            investment.status
                          }
                        </span>
                      </td>

                      <td>
                        <div className="investment-admin-actions">
                          <button
                            type="button"
                            title="Send message"
                            onClick={() =>
                              sendMessage(
                                investment
                              )
                            }
                            disabled={
                              workingId ===
                              investment._id
                            }
                          >
                            <MessageSquare
                              size={15}
                            />
                          </button>

                          {investment.status ===
                            "active" && (
                            <>
                              <button
                                type="button"
                                title="Set projected return"
                                onClick={() =>
                                  updateProjection(
                                    investment
                                  )
                                }
                                disabled={
                                  workingId ===
                                  investment._id
                                }
                              >
                                <Edit3
                                  size={15}
                                />
                              </button>

                              <button
                                type="button"
                                title="Complete investment"
                                className="investment-complete-action"
                                onClick={() =>
                                  completeInvestment(
                                    investment
                                  )
                                }
                                disabled={
                                  workingId ===
                                  investment._id
                                }
                              >
                                <CheckCircle2
                                  size={15}
                                />
                              </button>

                              <button
                                type="button"
                                title="Cancel investment"
                                className="investment-cancel-action"
                                onClick={() =>
                                  cancelInvestment(
                                    investment
                                  )
                                }
                                disabled={
                                  workingId ===
                                  investment._id
                                }
                              >
                                <Ban
                                  size={15}
                                />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}