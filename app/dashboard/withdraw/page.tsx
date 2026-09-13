"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpFromLine,
  Clock3,
  LoaderCircle,
  Send,
  ShieldAlert,
} from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import { AppShell } from "@/components/app-shell";

type Wallet = {
  _id: string;
  key: string;
  name: string;
  symbol: string;
  network: string;
};

type Withdrawal = {
  _id: string;
  amount: number;
  cryptoAsset: string;
  network: string;
  walletAddress: string;
  status:
    | "processing"
    | "on_the_way"
    | "blocked";
  adminMessage: string;
  createdAt: string;
};

type Account = {
  depositBalance: number;
  profitBalance: number;
  totalBalance: number;
  processingTotal: number;
  availableToWithdraw: number;
  withdrawalsBlocked: boolean;
  withdrawalBlockMessage: string;
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function statusText(
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

export default function WithdrawPage() {
  const [wallets, setWallets] =
    useState<Wallet[]>([]);

  const [withdrawals, setWithdrawals] =
    useState<Withdrawal[]>([]);

  const [account, setAccount] =
    useState<Account | null>(null);

  const [walletKey, setWalletKey] =
    useState("");

  const [walletAddress, setWalletAddress] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const loadWithdrawals = useCallback(
    async () => {
      try {
        setError("");

        const response = await fetch(
          `/api/withdrawals?refresh=${Date.now()}`,
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

        const freshWallets =
          data.wallets || [];

        setWallets(freshWallets);
        setWithdrawals(
          data.withdrawals || []
        );
        setAccount(data.account || null);

        setWalletKey((current) => {
          if (
            current &&
            freshWallets.some(
              (wallet: Wallet) =>
                wallet.key === current
            )
          ) {
            return current;
          }

          return freshWallets[0]?.key || "";
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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        "/api/withdrawals",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            amount,
            walletKey,
            walletAddress,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to submit withdrawal."
        );
      }

      setSuccess(data.message);
      setAmount("");
      setWalletAddress("");

      await loadWithdrawals();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to submit withdrawal."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <AppShell mode="user">
        <div className="dashboard-state">
          <LoaderCircle
            className="spin"
            size={30}
          />

          <p>Loading withdrawals...</p>
        </div>
      </AppShell>
    );
  }

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

          <h1>Withdraw funds</h1>

          <p>
            Submit a demo withdrawal to your
            receiving crypto wallet.
          </p>
        </div>

        <div className="avatar">
          <ArrowUpFromLine size={20} />
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

      {account?.withdrawalsBlocked && (
        <div className="form-message form-error">
          <ShieldAlert size={18} />

          {account.withdrawalBlockMessage ||
            "Withdrawals are blocked for your account."}
        </div>
      )}

      <section className="admin-metrics">
        <article className="summary-card">
          <strong>
            {formatMoney(
              account?.totalBalance || 0
            )}
          </strong>

          <span>Total balance</span>
        </article>

        <article className="summary-card">
          <strong>
            {formatMoney(
              account?.processingTotal || 0
            )}
          </strong>

          <span>Processing</span>
        </article>

        <article className="summary-card">
          <strong>
            {formatMoney(
              account?.availableToWithdraw ||
                0
            )}
          </strong>

          <span>Available to withdraw</span>
        </article>
      </section>

      <div className="deposit-page-grid">
        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">
                Withdrawal method
              </span>

              <h2>Select an asset</h2>
            </div>
          </div>

          <div className="crypto-option-grid">
            {wallets.map((wallet) => (
              <button
                type="button"
                key={wallet._id}
                className={`crypto-option ${
                  walletKey === wallet.key
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setWalletKey(wallet.key)
                }
              >
                <span className="crypto-symbol">
                  {wallet.symbol}
                </span>

                <span>
                  <strong>
                    {wallet.name}
                  </strong>

                  <small>
                    {wallet.network}
                  </small>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">
                Withdrawal details
              </span>

              <h2>Request withdrawal</h2>

              <p>
                Profit balance is used first,
                followed by deposit balance.
              </p>
            </div>
          </div>

          <form
            className="dashboard-form"
            onSubmit={handleSubmit}
          >
            <label>
              Amount in USD

              <input
                type="number"
                min="1"
                step="0.01"
                max={
                  account?.availableToWithdraw
                }
                placeholder="Example: 500"
                value={amount}
                onChange={(event) =>
                  setAmount(
                    event.target.value
                  )
                }
                disabled={
                  account?.withdrawalsBlocked
                }
                required
              />
            </label>

            <label>
              Receiving wallet address

              <input
                type="text"
                placeholder="Enter your receiving wallet"
                value={walletAddress}
                onChange={(event) =>
                  setWalletAddress(
                    event.target.value
                  )
                }
                disabled={
                  account?.withdrawalsBlocked
                }
                required
              />
            </label>

            <button
              type="submit"
              className="dashboard-submit-button"
              disabled={
                submitting ||
                account?.withdrawalsBlocked
              }
            >
              {submitting ? (
                <>
                  <LoaderCircle
                    className="spin"
                    size={18}
                  />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit withdrawal
                </>
              )}
            </button>
          </form>
        </section>
      </div>

      <section className="dashboard-panel admin-section">
        <div className="panel-heading">
          <div>
            <span className="panel-eyebrow">
              Withdrawal history
            </span>

            <h2>Your requests</h2>
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

        {withdrawals.length === 0 ? (
          <div className="admin-empty-state">
            <Clock3 size={27} />
            <h3>No withdrawals yet</h3>
          </div>
        ) : (
          <div className="responsive-table">
            <table className="admin-live-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Amount</th>
                  <th>Wallet</th>
                  <th>Status</th>
                  <th>Admin message</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {withdrawals.map(
                  (withdrawal) => (
                    <tr key={withdrawal._id}>
                      <td>
                        <strong>
                          {
                            withdrawal.cryptoAsset
                          }
                        </strong>

                        <small>
                          {withdrawal.network}
                        </small>
                      </td>

                      <td>
                        {formatMoney(
                          withdrawal.amount
                        )}
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
                          className={`status status-${withdrawal.status}`}
                        >
                          {statusText(
                            withdrawal.status
                          )}
                        </span>
                      </td>

                      <td>
                        {withdrawal.adminMessage ||
                          "No message"}
                      </td>

                      <td>
                        {new Date(
                          withdrawal.createdAt
                        ).toLocaleDateString()}
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