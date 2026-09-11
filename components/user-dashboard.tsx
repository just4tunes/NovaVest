"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  CircleDollarSign,
  Clock3,
  Landmark,
  LoaderCircle,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { PerformanceChart } from "@/components/performance-chart";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  depositBalance: number;
  profitBalance: number;
  totalBalance: number;
  accountStatus: "active" | "suspended";
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

type Transaction = {
  _id: string;
  type: "deposit" | "profit";
  amount: number;
  description: string;
  reference: string;
  createdAt: string;
};

type ChartPoint = {
  date: string;
  deposits: number;
  profits: number;
  total: number;
};

type ActivityItem = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  status: string;
  date: string;
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

export function UserDashboard() {
  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [deposits, setDeposits] = useState<
    Deposit[]
  >([]);

  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [chartData, setChartData] = useState<
    ChartPoint[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [
          profileResponse,
          activityResponse,
          performanceResponse,
        ] = await Promise.all([
          fetch("/api/user/profile", {
            cache: "no-store",
          }),

          fetch("/api/user/transactions", {
            cache: "no-store",
          }),

          fetch("/api/user/performance", {
            cache: "no-store",
          }),
        ]);

        const profileData =
          await profileResponse.json();

        const activityData =
          await activityResponse.json();

        const performanceData =
          await performanceResponse.json();

        if (!profileResponse.ok) {
          throw new Error(
            profileData.message ||
              "Unable to load your account."
          );
        }

        if (!activityResponse.ok) {
          throw new Error(
            activityData.message ||
              "Unable to load your transactions."
          );
        }

        if (!performanceResponse.ok) {
          throw new Error(
            performanceData.message ||
              "Unable to load your performance."
          );
        }

        setProfile(profileData.user);
        setDeposits(activityData.deposits || []);
        setTransactions(
          activityData.transactions || []
        );

        setChartData(
          performanceData.chartData || []
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load the dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-state">
        <LoaderCircle className="spin" size={30} />
        <p>Loading your account...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="dashboard-state dashboard-error">
        <h2>Dashboard unavailable</h2>
        <p>{error || "Account not found."}</p>
      </div>
    );
  }

  const pendingDeposits = deposits.filter(
    (deposit) => deposit.status === "processing"
  );

  const depositActivities: ActivityItem[] =
    deposits
      .filter(
        (deposit) =>
          deposit.status !== "approved"
      )
      .map((deposit) => ({
        id: deposit._id,
        title: `${deposit.cryptoAsset} deposit`,
        subtitle: deposit.network,
        amount: deposit.amount,
        status: deposit.status,
        date: deposit.createdAt,
      }));

  const transactionActivities: ActivityItem[] =
    transactions.map((transaction) => ({
      id: transaction._id,
      title:
        transaction.type === "profit"
          ? "Profit awarded"
          : "Deposit approved",
      subtitle: transaction.description,
      amount: transaction.amount,
      status: "completed",
      date: transaction.createdAt,
    }));

  const recentActivity = [
    ...depositActivities,
    ...transactionActivities,
  ]
    .sort(
      (first, second) =>
        new Date(second.date).getTime() -
        new Date(first.date).getTime()
    )
    .slice(0, 8);

  return (
    <>
      <header className="dashboard-header">
        <div>
          <p>
            {new Date().toLocaleDateString(
              "en-US",
              {
                weekday: "long",
                month: "long",
                day: "numeric",
              }
            )}
          </p>

          <h1>
            Welcome back,{" "}
            {profile.name.split(" ")[0]}
          </h1>
        </div>

        <Link
          href="/dashboard/profile"
          className="avatar"
          aria-label="Open profile"
        >
          {initials(profile.name)}
        </Link>
      </header>

      <section className="user-balance-grid">
        <article className="account-balance-card primary-balance-card">
          <div className="account-card-top">
            <span>Total demo balance</span>
            <Wallet size={21} />
          </div>

          <strong>
            {formatMoney(profile.totalBalance)}
          </strong>

          <p>
            Deposit balance plus awarded profits
          </p>

          <Link
            href="/dashboard/deposit"
            className="balance-card-button"
          >
            <ArrowDownToLine size={17} />
            Make a deposit
          </Link>
        </article>

        <article className="account-balance-card">
          <div className="account-card-top">
            <span>Deposit balance</span>

            <Landmark size={20} />
          </div>

          <strong>
            {formatMoney(
              profile.depositBalance
            )}
          </strong>

          <p>Approved demo deposits</p>
        </article>

        <article className="account-balance-card">
          <div className="account-card-top">
            <span>Profit balance</span>

            <TrendingUp size={20} />
          </div>

          <strong className="profit-value">
            {formatMoney(profile.profitBalance)}
          </strong>

          <p>Profits awarded by administration</p>
        </article>

        <article className="account-balance-card">
          <div className="account-card-top">
            <span>Processing</span>

            <Clock3 size={20} />
          </div>

          <strong>
            {pendingDeposits.length}
          </strong>

          <p>
            Deposit request
            {pendingDeposits.length === 1
              ? ""
              : "s"}{" "}
            awaiting review
          </p>
        </article>
      </section>

      <section className="user-dashboard-grid">
        <article className="dashboard-panel performance-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">
                Demo performance
              </span>

              <h2>Deposits and profits</h2>

              <p>
                Your cumulative account activity
              </p>
            </div>

            <CircleDollarSign size={23} />
          </div>

          <PerformanceChart data={chartData} />
        </article>

        <article className="dashboard-panel quick-action-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">
                Account
              </span>

              <h2>Quick actions</h2>
            </div>
          </div>

          <div className="quick-action-list">
            <Link href="/dashboard/deposit">
              <span className="quick-action-icon">
                <ArrowDownToLine size={19} />
              </span>

              <span>
                <strong>Deposit funds</strong>
                <small>
                  Submit a demo crypto deposit
                </small>
              </span>

              <ArrowRight size={18} />
            </Link>

            <Link href="/dashboard/profile">
              <span className="quick-action-icon">
                <Wallet size={19} />
              </span>

              <span>
                <strong>Account settings</strong>
                <small>
                  Update your profile and password
                </small>
              </span>

              <ArrowRight size={18} />
            </Link>
          </div>
        </article>
      </section>

      <section
        className="dashboard-panel transaction-panel"
        id="transactions"
      >
        <div className="panel-heading">
          <div>
            <span className="panel-eyebrow">
              Account activity
            </span>

            <h2>Transaction history</h2>

            <p>
              Deposits and profits recorded on your
              account
            </p>
          </div>
        </div>

        {recentActivity.length === 0 ? (
          <div className="transaction-empty">
            <ReceiptEmptyIcon />

            <h3>No transactions yet</h3>

            <p>
              Your deposit and profit activity will
              appear here.
            </p>

            <Link href="/dashboard/deposit">
              Submit your first demo deposit
            </Link>
          </div>
        ) : (
          <div className="responsive-table">
            <table className="user-transaction-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentActivity.map((item) => (
                  <tr key={`${item.id}-${item.status}`}>
                    <td>
                      <strong>{item.title}</strong>
                      <span>{item.subtitle}</span>
                    </td>

                    <td>
                      {new Date(
                        item.date
                      ).toLocaleDateString()}
                    </td>

                    <td>
                      +{formatMoney(item.amount)}
                    </td>

                    <td>
                      <span
                        className={`transaction-status status-${item.status}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function ReceiptEmptyIcon() {
  return (
    <div className="transaction-empty-icon">
      <ArrowDownToLine size={24} />
    </div>
  );
}