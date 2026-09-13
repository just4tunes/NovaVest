"use client";

import {
  ArrowUpFromLine,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  DollarSign,
  LoaderCircle,
  ReceiptText,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { AppShell } from "@/components/app-shell";

type TransactionUser = {
  _id: string;
  name: string;
  email: string;
};

type TransactionType =
  | "deposit"
  | "profit"
  | "withdrawal"
  | "investment"
  | "adjustment";

type Transaction = {
  _id: string;
  userId: TransactionUser | null;
  type: TransactionType;
  amount: number;
  description: string;
  reference: string;
  balanceAfter: number;
  createdBy: TransactionUser | null;
  createdAt: string;
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function formatType(type: TransactionType) {
  switch (type) {
    case "deposit":
      return "Deposit";

    case "profit":
      return "Profit";

    case "withdrawal":
      return "Withdrawal";

    case "investment":
      return "Investment";

    case "adjustment":
      return "Balance adjustment";
  }
}

function TransactionIcon({
  transaction,
}: {
  transaction: Transaction;
}) {
  if (
    transaction.type === "investment" ||
    transaction.reference.startsWith(
      "INV-"
    )
  ) {
    return (
      <BriefcaseBusiness size={16} />
    );
  }

  if (
    transaction.type === "profit"
  ) {
    return <TrendingUp size={16} />;
  }

  if (
    transaction.type === "withdrawal"
  ) {
    return (
      <ArrowUpFromLine size={16} />
    );
  }

  if (
    transaction.type === "adjustment"
  ) {
    return (
      <SlidersHorizontal size={16} />
    );
  }

  return <CheckCircle2 size={16} />;
}

export default function AuditLogPage() {
  const [
    transactions,
    setTransactions,
  ] = useState<Transaction[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadTransactions =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/admin/transactions?refresh=${Date.now()}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load audit log."
          );
        }

        setTransactions(
          data.transactions || []
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load audit log."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadTransactions();
  }, [loadTransactions]);

  const depositCount =
    transactions.filter(
      (transaction) =>
        transaction.type === "deposit"
    ).length;

  const profitCount =
    transactions.filter(
      (transaction) =>
        transaction.type === "profit"
    ).length;

  const investmentCount =
    transactions.filter(
      (transaction) =>
        transaction.type ===
          "investment" ||
        transaction.reference.startsWith(
          "INV-"
        )
    ).length;

  return (
    <AppShell mode="admin">
      <header className="dashboard-header">
        <div>
          <p>
            Administration history
          </p>

          <h1>Audit log</h1>

          <span>
            Review financial actions
            performed through the admin
            dashboard.
          </span>
        </div>

        <div className="avatar">
          <ReceiptText size={20} />
        </div>
      </header>

      {error && (
        <div className="form-message form-error">
          {error}
        </div>
      )}

      <section className="admin-metrics">
        <article className="summary-card">
          <div className="card-icon">
            <Clock3 size={20} />
          </div>

          <strong>
            {transactions.length}
          </strong>

          <span>Total records</span>
        </article>

        <article className="summary-card">
          <div className="card-icon">
            <DollarSign size={20} />
          </div>

          <strong>
            {depositCount}
          </strong>

          <span>Approved deposits</span>
        </article>

        <article className="summary-card">
          <div className="card-icon">
            <TrendingUp size={20} />
          </div>

          <strong>
            {profitCount}
          </strong>

          <span>Profit records</span>
        </article>

        <article className="summary-card">
          <div className="card-icon">
            <BriefcaseBusiness
              size={20}
            />
          </div>

          <strong>
            {investmentCount}
          </strong>

          <span>Investment actions</span>
        </article>
      </section>

      <section className="dashboard-panel admin-section">
        <div className="panel-heading">
          <div>
            <span className="panel-eyebrow">
              Activity records
            </span>

            <h2>
              Financial history
            </h2>

            <p>
              Deposits, profits,
              investments, withdrawals and
              balance changes recorded by
              NovaVest.
            </p>
          </div>

          <button
            type="button"
            className="receipt-button"
            onClick={() =>
              void loadTransactions()
            }
            disabled={loading}
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
              Loading audit history...
            </p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="admin-empty-state">
            <ReceiptText size={28} />

            <h3>
              No activity recorded
            </h3>

            <p>
              Financial account activity
              will appear here.
            </p>
          </div>
        ) : (
          <div className="responsive-table">
            <table className="admin-live-table">
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>User</th>
                  <th>Amount</th>
                  <th>
                    Balance after
                  </th>
                  <th>Reference</th>
                  <th>Performed by</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map(
                  (transaction) => (
                    <tr
                      key={
                        transaction._id
                      }
                    >
                      <td>
                        <div className="admin-user-cell">
                          <span className="small-avatar">
                            <TransactionIcon
                              transaction={
                                transaction
                              }
                            />
                          </span>

                          <span>
                            <strong>
                              {
                                transaction.description
                              }
                            </strong>

                            <small>
                              {formatType(
                                transaction.type
                              )}
                            </small>
                          </span>
                        </div>
                      </td>

                      <td>
                        <strong>
                          {transaction.userId
                            ?.name ||
                            "Deleted user"}
                        </strong>

                        <small>
                          {transaction.userId
                            ?.email || ""}
                        </small>
                      </td>

                      <td>
                        <strong>
                          {transaction.amount >
                          0
                            ? "+"
                            : transaction.amount <
                                0
                              ? "-"
                              : ""}

                          {formatMoney(
                            Math.abs(
                              transaction.amount
                            )
                          )}
                        </strong>
                      </td>

                      <td>
                        {formatMoney(
                          transaction.balanceAfter
                        )}
                      </td>

                      <td>
                        <code>
                          {
                            transaction.reference
                          }
                        </code>
                      </td>

                      <td>
                        {transaction.createdBy
                          ?.name || "System"}
                      </td>

                      <td>
                        {formatDate(
                          transaction.createdAt
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}
