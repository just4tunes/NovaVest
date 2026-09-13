"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Check,
  Clock3,
  DollarSign,
  Eye,
  LoaderCircle,
  TrendingUp,
  UserRound,
  Users,
  X,
} from "lucide-react";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  accountStatus: string;
  depositBalance: number;
  profitBalance: number;
  totalBalance: number;
  createdAt: string;
};

type DepositUser = {
  _id: string;
  name: string;
  email: string;
  accountStatus: string;
};

type Deposit = {
  _id: string;
  userId: DepositUser;
  amount: number;
  cryptoAsset: string;
  network: string;
  walletAddress: string;
  transactionHash: string;
  receiptUrl: string;
  status:
    | "processing"
    | "approved"
    | "rejected";
  adminNote: string;
  createdAt: string;
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

export function AdminDashboard() {
  const [users, setUsers] = useState<
    AdminUser[]
  >([]);

  const [deposits, setDeposits] = useState<
    Deposit[]
  >([]);

  const [profitAmounts, setProfitAmounts] =
    useState<Record<string, string>>({});

  const [profitNotes, setProfitNotes] =
    useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [receipt, setReceipt] = useState<{
    image: string;
    user: string;
  } | null>(null);

  const loadAdminData = useCallback(
    async () => {
      try {
        const [
          usersResponse,
          depositsResponse,
        ] = await Promise.all([
          fetch("/api/admin/users", {
            cache: "no-store",
          }),

          fetch("/api/admin/deposits", {
            cache: "no-store",
          }),
        ]);

        const usersData =
          await usersResponse.json();

        const depositsData =
          await depositsResponse.json();

        if (!usersResponse.ok) {
          throw new Error(
            usersData.message ||
              "Unable to load users."
          );
        }

        if (!depositsResponse.ok) {
          throw new Error(
            depositsData.message ||
              "Unable to load deposits."
          );
        }

        setError("");
        setUsers(usersData.users || []);
        setDeposits(
          depositsData.deposits || []
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load admin information."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  void loadAdminData();
}, [loadAdminData]);

  async function reviewDeposit(
    depositId: string,
    action: "approve" | "reject"
  ) {
    const confirmation =
      action === "approve"
        ? "Approve this deposit and automatically credit the user's deposit balance?"
        : "Reject this deposit request?";

    if (!window.confirm(confirmation)) {
      return;
    }

    try {
      setWorkingId(depositId);
      setMessage("");
      setError("");

      const response = await fetch(
        `/api/admin/deposits/${depositId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            adminNote:
              action === "approve"
                ? "Demo deposit confirmed"
                : "Demo deposit rejected",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to review deposit."
        );
      }

      setMessage(data.message);
      await loadAdminData();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to review deposit."
      );
    } finally {
      setWorkingId("");
    }
  }

  async function awardProfit(userId: string) {
    const amount = Number(
      profitAmounts[userId]
    );

    if (!Number.isFinite(amount) || amount <= 0) {
      setError(
        "Enter a valid profit amount greater than zero."
      );
      return;
    }

    const confirmed = window.confirm(
      `Award ${formatMoney(
        amount
      )} in demo profit to this user?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setWorkingId(userId);
      setMessage("");
      setError("");

      const response = await fetch(
        `/api/admin/users/${userId}/profit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount,
            note:
              profitNotes[userId] ||
              "Demo investment profit",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to award profit."
        );
      }

      setProfitAmounts((current) => ({
        ...current,
        [userId]: "",
      }));

      setProfitNotes((current) => ({
        ...current,
        [userId]: "",
      }));

      setMessage(data.message);
      await loadAdminData();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to award profit."
      );
    } finally {
      setWorkingId("");
    }
  }

  if (loading) {
    return (
      <div className="dashboard-state">
        <LoaderCircle
          className="spin"
          size={30}
        />

        <p>Loading administration...</p>
      </div>
    );
  }

  const pendingDeposits = deposits.filter(
    (deposit) =>
      deposit.status === "processing"
  );

  const totalDepositBalances = users.reduce(
    (total, user) =>
      total + user.depositBalance,
    0
  );

  const totalProfitBalances = users.reduce(
    (total, user) =>
      total + user.profitBalance,
    0
  );

  return (
    <>
      <header className="dashboard-header">
        <div>
          <p>Demo operations</p>
          <h1>Admin overview</h1>
        </div>

        <div className="avatar">FK</div>
      </header>

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
            <Users size={20} />
          </div>

          <strong>{users.length}</strong>
          <span>Total users</span>
        </article>

        <article className="summary-card">
          <div className="card-icon">
            <DollarSign size={20} />
          </div>

          <strong>
            {formatMoney(
              totalDepositBalances
            )}
          </strong>

          <span>Deposit balances</span>
        </article>

        <article className="summary-card">
          <div className="card-icon">
            <Clock3 size={20} />
          </div>

          <strong>
            {pendingDeposits.length}
          </strong>

          <span>Pending deposits</span>
        </article>

        <article className="summary-card">
          <div className="card-icon">
            <TrendingUp size={20} />
          </div>

          <strong>
            {formatMoney(
              totalProfitBalances
            )}
          </strong>

          <span>Awarded profits</span>
        </article>
      </section>

      <section className="dashboard-panel admin-section">
        <div className="panel-heading">
          <div>
            <span className="panel-eyebrow">
              Deposit management
            </span>

            <h2>Requests needing review</h2>

            <p>
              Approve or reject simulated deposits
            </p>
          </div>

          <span className="pending-count">
            {pendingDeposits.length} pending
          </span>
        </div>

        {pendingDeposits.length === 0 ? (
          <div className="admin-empty-state">
            <Check size={26} />

            <h3>No pending deposits</h3>

            <p>
              New user requests will appear here.
            </p>
          </div>
        ) : (
          <div className="responsive-table">
            <table className="admin-live-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Deposit</th>
                  <th>Reference</th>
                  <th>Receipt</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {pendingDeposits.map(
                  (deposit) => (
                    <tr key={deposit._id}>
                      <td>
                        <div className="admin-user-cell">
                          <span className="small-avatar">
                            {getInitials(
                              deposit.userId.name
                            )}
                          </span>

                          <span>
                            <strong>
                              {deposit.userId.name}
                            </strong>

                            <small>
                              {
                                deposit.userId
                                  .email
                              }
                            </small>
                          </span>
                        </div>
                      </td>

                      <td>
                        <strong>
                          {formatMoney(
                            deposit.amount
                          )}
                        </strong>

                        <small>
                          {deposit.cryptoAsset} ·{" "}
                          {deposit.network}
                        </small>
                      </td>

                      <td>
                        <code>
                          {
                            deposit.transactionHash
                          }
                        </code>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="receipt-button"
                          onClick={() =>
                            setReceipt({
                              image:
                                deposit.receiptUrl,
                              user:
                                deposit.userId
                                  .name,
                            })
                          }
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>

                      <td>
                        {new Date(
                          deposit.createdAt
                        ).toLocaleDateString()}
                      </td>

                      <td>
                        <div className="request-actions">
                          <button
                            type="button"
                            aria-label="Reject deposit"
                            disabled={
                              workingId ===
                              deposit._id
                            }
                            onClick={() =>
                              reviewDeposit(
                                deposit._id,
                                "reject"
                              )
                            }
                          >
                            <X size={16} />
                          </button>

                          <button
                            type="button"
                            className="approve-button"
                            aria-label="Approve deposit"
                            disabled={
                              workingId ===
                              deposit._id
                            }
                            onClick={() =>
                              reviewDeposit(
                                deposit._id,
                                "approve"
                              )
                            }
                          >
                            {workingId ===
                            deposit._id ? (
                              <LoaderCircle
                                className="spin"
                                size={16}
                              />
                            ) : (
                              <Check size={16} />
                            )}
                          </button>
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

      <section className="dashboard-panel admin-section">
        <div className="panel-heading">
          <div>
            <span className="panel-eyebrow">
              User management
            </span>

            <h2>User accounts</h2>

            <p>
              View balances and award simulated
              profits
            </p>
          </div>

          <UserRound size={23} />
        </div>

        {users.length === 0 ? (
          <div className="admin-empty-state">
            <Users size={26} />
            <h3>No normal users found</h3>
          </div>
        ) : (
          <div className="admin-user-grid">
            {users.map((user) => (
              <article
                className="admin-user-card"
                key={user.id}
              >
                <div className="admin-user-heading">
                  <span className="small-avatar">
                    {getInitials(user.name)}
                  </span>

                  <span>
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </span>
                </div>

                <div className="admin-user-balances">
                  <span>
                    Deposit

                    <strong>
                      {formatMoney(
                        user.depositBalance
                      )}
                    </strong>
                  </span>

                  <span>
                    Profit

                    <strong>
                      {formatMoney(
                        user.profitBalance
                      )}
                    </strong>
                  </span>

                  <span>
                    Total

                    <strong>
                      {formatMoney(
                        user.totalBalance
                      )}
                    </strong>
                  </span>
                </div>

                <div className="profit-form">
                  <label>
                    Profit amount

                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Example: 50"
                      value={
                        profitAmounts[user.id] ||
                        ""
                      }
                      onChange={(event) =>
                        setProfitAmounts(
                          (current) => ({
                            ...current,
                            [user.id]:
                              event.target.value,
                          })
                        )
                      }
                    />
                  </label>

                  <label>
                    Note

                    <input
                      type="text"
                      placeholder="Demo weekly profit"
                      value={
                        profitNotes[user.id] ||
                        ""
                      }
                      onChange={(event) =>
                        setProfitNotes(
                          (current) => ({
                            ...current,
                            [user.id]:
                              event.target.value,
                          })
                        )
                      }
                    />
                  </label>

                  <button
                    type="button"
                    disabled={
                      workingId === user.id
                    }
                    onClick={() =>
                      awardProfit(user.id)
                    }
                  >
                    {workingId === user.id ? (
                      <LoaderCircle
                        className="spin"
                        size={17}
                      />
                    ) : (
                      <TrendingUp size={17} />
                    )}

                    Award profit
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {receipt && (
        <div
          className="receipt-modal"
          onClick={() => setReceipt(null)}
        >
          <div
            className="receipt-modal-content"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div>
              <h2>
                {receipt.user}&apos;s receipt
              </h2>

              <button
                type="button"
                onClick={() => setReceipt(null)}
                aria-label="Close receipt"
              >
                <X size={20} />
              </button>
            </div>

            {receipt.image ? (
              <Image
                src={receipt.image}
                alt={`Receipt submitted by ${receipt.user}`}
                width={800}
                height={800}
                unoptimized
              />
            ) : (
              <p>
                No receipt image was submitted.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
