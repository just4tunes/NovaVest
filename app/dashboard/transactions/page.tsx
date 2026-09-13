"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpFromLine,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  ReceiptText,
  TrendingUp,
  XCircle,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { AppShell } from "@/components/app-shell";

type TransactionCategory =
  | "deposit"
  | "profit"
  | "withdrawal"
  | "investment"
  | "adjustment";

type Transaction = {
  _id: string;
  type: TransactionCategory;
  amount: number;
  description: string;
  reference: string;
  balanceAfter: number;
  createdAt: string;
};

type Deposit = {
  _id: string;
  amount: number;
  cryptoAsset: string;
  network: string;
  transactionHash: string;
  status:
    | "processing"
    | "approved"
    | "rejected";
  createdAt: string;
};

type ActivityStatus =
  | "processing"
  | "approved"
  | "rejected"
  | "completed"
  | "active";

type Activity = {
  id: string;
  title: string;
  details: string;
  amount: number;
  reference: string;
  status: ActivityStatus;
  date: string;
  balanceAfter?: number;
  category: TransactionCategory;
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

function formatStatus(status: ActivityStatus) {
  return (
    status.charAt(0).toUpperCase() +
    status.slice(1)
  );
}

function getTransactionDetails(
  type: TransactionCategory
) {
  switch (type) {
    case "profit":
      return "Profit awarded by administration";

    case "withdrawal":
      return "Withdrawal confirmed by administration";

    case "investment":
      return "Funds moved into an investment plan";

    case "adjustment":
      return "Balance adjustment by administration";

    default:
      return "Approved account deposit";
  }
}

function StatusIcon({
  status,
}: {
  status: ActivityStatus;
}) {
  if (
    status === "processing" ||
    status === "active"
  ) {
    return <Clock3 size={17} />;
  }

  if (status === "rejected") {
    return <XCircle size={17} />;
  }

  return <CheckCircle2 size={17} />;
}

function ActivityIcon({
  category,
}: {
  category: TransactionCategory;
}) {
  switch (category) {
    case "profit":
      return <TrendingUp size={16} />;

    case "investment":
      return <BriefcaseBusiness size={16} />;

    case "withdrawal":
      return <ArrowUpFromLine size={16} />;

    default:
      return <ReceiptText size={16} />;
  }
}

export default function TransactionsPage() {
  const [activities, setActivities] =
    useState<Activity[]>([]);

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
          `/api/user/transactions?refresh=${Date.now()}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load transactions."
          );
        }

        const transactions: Transaction[] =
          data.transactions || [];

        const deposits: Deposit[] =
          data.deposits || [];

        const depositActivities: Activity[] =
          deposits.map((deposit) => ({
            id: `deposit-${deposit._id}`,
            title: `${deposit.cryptoAsset} deposit`,
            details: deposit.network,
            amount: deposit.amount,
            reference:
              deposit.transactionHash,
            status: deposit.status,
            date: deposit.createdAt,
            category: "deposit",
          }));

        /*
         * Approved deposits are already included
         * above, so their matching transactions
         * are excluded to prevent duplicates.
         */
        const balanceActivities: Activity[] =
          transactions
            .filter(
              (transaction) =>
                transaction.type !== "deposit"
            )
            .map((transaction) => ({
              id: `transaction-${transaction._id}`,
              title:
                transaction.description ||
                "Account transaction",
              details:
                getTransactionDetails(
                  transaction.type
                ),
              amount: transaction.amount,
              reference:
                transaction.reference,
              status:
                transaction.type ===
                "investment"
                  ? "active"
                  : "completed",
              date: transaction.createdAt,
              balanceAfter:
                transaction.balanceAfter,
              category: transaction.type,
            }));

        const combinedActivities = [
          ...depositActivities,
          ...balanceActivities,
        ].sort(
          (first, second) =>
            new Date(
              second.date
            ).getTime() -
            new Date(first.date).getTime()
        );

        setActivities(
          combinedActivities
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load transactions."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  return (
    <AppShell mode="user">
      <header className="dashboard-header">
        <div>
          <Link
            href="/dashboard"
            className="page-back-link"
          >
            <ArrowLeft size={16} />
            Back to overview
          </Link>

          <h1>Transaction history</h1>

          <p>
            Review your deposits, profits,
            investments, withdrawals and
            simulated account activity.
          </p>
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

      <section className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <span className="panel-eyebrow">
              Account activity
            </span>

            <h2>All transactions</h2>

            <p>
              {activities.length} recorded{" "}
              {activities.length === 1
                ? "transaction"
                : "transactions"}
            </p>
          </div>

          <button
            type="button"
            className="receipt-button"
            onClick={() =>
              void loadTransactions()
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
              Loading transactions...
            </p>
          </div>
        ) : activities.length === 0 ? (
          <div className="admin-empty-state">
            <ReceiptText size={28} />

            <h3>No transactions yet</h3>

            <p>
              Your deposits, profits and
              investments will appear here.
            </p>
          </div>
        ) : (
          <div className="responsive-table">
            <table className="admin-live-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Amount</th>
                  <th>Reference</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Balance after</th>
                </tr>
              </thead>

              <tbody>
                {activities.map(
                  (activity) => (
                    <tr key={activity.id}>
                      <td>
                        <div className="admin-user-cell">
                          <span className="small-avatar">
                            <ActivityIcon
                              category={
                                activity.category
                              }
                            />
                          </span>

                          <span>
                            <strong>
                              {activity.title}
                            </strong>

                            <small>
                              {activity.details}
                            </small>
                          </span>
                        </div>
                      </td>

                      <td>
                        <strong>
                          {activity.amount > 0
                            ? "+"
                            : activity.amount < 0
                              ? "-"
                              : ""}
                          {formatMoney(
                            Math.abs(
                              activity.amount
                            )
                          )}
                        </strong>
                      </td>

                      <td>
                        <code>
                          {activity.reference}
                        </code>
                      </td>

                      <td>
                        <span
                          className={`status status-${activity.status}`}
                        >
                          <StatusIcon
                            status={
                              activity.status
                            }
                          />

                          {formatStatus(
                            activity.status
                          )}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          activity.date
                        )}
                      </td>

                      <td>
                        {activity.balanceAfter !==
                        undefined
                          ? formatMoney(
                              activity.balanceAfter
                            )
                          : "—"}
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
