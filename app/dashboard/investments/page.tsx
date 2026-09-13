"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CircleDollarSign,
  LoaderCircle,
  ShieldCheck,
  TrendingUp,
  X,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";

type InvestmentPlan = {
  key: string;
  name: string;
  category: string;
  minimumAmount: number;
  targetRate: number;
  durationDays: number;
  riskLevel: string;
};

type Investment = {
  _id: string;
  planKey: string;
  planName: string;
  category: string;
  amount: number;
  targetRate: number;
  projectedReturn: number;
  durationDays: number;
  riskLevel: string;
  status: "active" | "completed" | "cancelled";
  startedAt: string;
  maturesAt: string;
  createdAt: string;
};

type InvestmentAccount = {
  depositBalance: number;
  profitBalance: number;
  investmentBalance: number;
  availableToInvest: number;
  totalBalance: number;
};

type InvestmentsResponse = {
  plans: InvestmentPlan[];
  investments: Investment[];
  account: InvestmentAccount;
  message?: string;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default function InvestmentsPage() {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);

  const [account, setAccount] =
    useState<InvestmentAccount>({
      depositBalance: 0,
      profitBalance: 0,
      investmentBalance: 0,
      availableToInvest: 0,
      totalBalance: 0,
    });

  const [selectedPlan, setSelectedPlan] =
    useState<InvestmentPlan | null>(null);

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadInvestments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/investments?refresh=${Date.now()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data: InvestmentsResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load investments."
        );
      }

      setPlans(data.plans || []);
      setInvestments(data.investments || []);
      setAccount(data.account);
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

  function openInvestment(plan: InvestmentPlan) {
    setSelectedPlan(plan);
    setAmount(
      String(plan.minimumAmount)
    );
    setError("");
    setMessage("");
  }

  function closeInvestment() {
    if (investing) {
      return;
    }

    setSelectedPlan(null);
    setAmount("");
  }

  async function handleInvestment(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!selectedPlan) {
      return;
    }

    try {
      setInvesting(true);
      setError("");
      setMessage("");

      const response = await fetch(
        "/api/investments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planKey: selectedPlan.key,
            amount: Number(amount),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to start investment."
        );
      }

      setMessage(data.message);
      setSelectedPlan(null);
      setAmount("");

      await loadInvestments();
    } catch (investmentError) {
      setError(
        investmentError instanceof Error
          ? investmentError.message
          : "Unable to start investment."
      );
    } finally {
      setInvesting(false);
    }
  }

  return (
    <AppShell>
      <header className="dashboard-header">
        <div>
          <p>Portfolio opportunities</p>
          <h1>Investments</h1>

          <span>
            Explore simulated plans and track your
            active portfolio.
          </span>
        </div>

        <div className="avatar">
          <BriefcaseBusiness size={20} />
        </div>
      </header>

      {error && (
        <div className="investment-alert investment-alert-error">
          {error}
        </div>
      )}

      {message && (
        <div className="investment-alert investment-alert-success">
          {message}
        </div>
      )}

      <section className="investment-balance-grid">
        <article className="summary-card">
          <div className="card-icon">
            <CircleDollarSign size={20} />
          </div>

          <strong>
            {formatCurrency(
              account.availableToInvest
            )}
          </strong>

          <span>Available to invest</span>
        </article>

        <article className="summary-card">
          <div className="card-icon">
            <BriefcaseBusiness size={20} />
          </div>

          <strong>
            {formatCurrency(
              account.investmentBalance
            )}
          </strong>

          <span>Active investments</span>
        </article>

        <article className="summary-card">
          <div className="card-icon">
            <TrendingUp size={20} />
          </div>

          <strong>
            {formatCurrency(
              account.totalBalance
            )}
          </strong>

          <span>Total portfolio balance</span>
        </article>
      </section>

      <section className="investment-section">
        <div className="investment-section-heading">
          <div>
            <p className="section-kicker">
              Investment plans
            </p>

            <h2>Choose your strategy</h2>

            <span>
              Select a plan that matches your
              simulated financial goals.
            </span>
          </div>
        </div>

        {loading ? (
          <div className="investment-loading">
            <LoaderCircle
              className="spin"
              size={28}
            />

            <span>Loading investment plans...</span>
          </div>
        ) : (
          <div className="investment-plan-grid">
            {plans.map((plan) => (
              <article
                className="investment-plan-card"
                key={plan.key}
              >
                <div className="investment-plan-top">
                  <span className="investment-category">
                    {plan.category}
                  </span>

                  <span className="investment-risk">
                    {plan.riskLevel} risk
                  </span>
                </div>

                <h3>{plan.name}</h3>

                <strong className="investment-minimum">
                  {formatCurrency(
                    plan.minimumAmount
                  )}
                </strong>

                <span className="investment-minimum-label">
                  Minimum investment
                </span>

                <div className="investment-plan-details">
                  <div>
                    <TrendingUp size={17} />

                    <span>
                      <strong>
                        {plan.targetRate}%
                      </strong>
                      Target return
                    </span>
                  </div>

                  <div>
                    <CalendarDays size={17} />

                    <span>
                      <strong>
                        {plan.durationDays} days
                      </strong>
                      Duration
                    </span>
                  </div>

                  <div>
                    <ShieldCheck size={17} />

                    <span>
                      <strong>
                        {plan.riskLevel}
                      </strong>
                      Risk profile
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="investment-button"
                  onClick={() =>
                    openInvestment(plan)
                  }
                >
                  Invest now
                  <ArrowRight size={17} />
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="investment-section">
        <div className="investment-section-heading">
          <div>
            <p className="section-kicker">
              Your portfolio
            </p>

            <h2>Active investments</h2>

            <span>
              Monitor your simulated plans and
              projected returns.
            </span>
          </div>
        </div>

        {investments.length === 0 ? (
          <div className="investment-empty">
            <BriefcaseBusiness size={28} />

            <h3>No investments yet</h3>

            <p>
              Choose one of the plans above to
              begin building your demo portfolio.
            </p>
          </div>
        ) : (
          <div className="active-investment-grid">
            {investments.map((investment) => (
              <article
                className="active-investment-card"
                key={investment._id}
              >
                <div className="active-investment-heading">
                  <div>
                    <span>
                      {investment.category}
                    </span>

                    <h3>
                      {investment.planName}
                    </h3>
                  </div>

                  <span
                    className={`investment-status investment-status-${investment.status}`}
                  >
                    {investment.status}
                  </span>
                </div>

                <div className="active-investment-values">
                  <div>
                    <span>Invested</span>

                    <strong>
                      {formatCurrency(
                        investment.amount
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Projected return</span>

                    <strong>
                      {formatCurrency(
                        investment.projectedReturn
                      )}
                    </strong>
                  </div>
                </div>

                <div className="active-investment-dates">
                  <span>
                    Started{" "}
                    {formatDate(
                      investment.startedAt
                    )}
                  </span>

                  <span>
                    Matures{" "}
                    {formatDate(
                      investment.maturesAt
                    )}
                  </span>
                </div>

                <small>
                  Projected returns are simulated
                  estimates and are not guaranteed.
                </small>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedPlan && (
        <div
          className="investment-modal-backdrop"
          role="presentation"
        >
          <div
            className="investment-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="investment-modal-title"
          >
            <div className="investment-modal-heading">
              <div>
                <span>
                  {selectedPlan.category}
                </span>

                <h2 id="investment-modal-title">
                  Invest in {selectedPlan.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeInvestment}
                aria-label="Close investment form"
              >
                <X size={20} />
              </button>
            </div>

            <div className="investment-modal-summary">
              <div>
                <span>Target return</span>
                <strong>
                  {selectedPlan.targetRate}%
                </strong>
              </div>

              <div>
                <span>Duration</span>
                <strong>
                  {selectedPlan.durationDays} days
                </strong>
              </div>

              <div>
                <span>Available</span>
                <strong>
                  {formatCurrency(
                    account.availableToInvest
                  )}
                </strong>
              </div>
            </div>

            <form onSubmit={handleInvestment}>
              <label htmlFor="investment-amount">
                Investment amount
              </label>

              <input
                id="investment-amount"
                type="number"
                min={selectedPlan.minimumAmount}
                step="0.01"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
                required
              />

              <small>
                Minimum:{" "}
                {formatCurrency(
                  selectedPlan.minimumAmount
                )}
              </small>

              <button
                type="submit"
                className="investment-button"
                disabled={investing}
              >
                {investing ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="spin"
                    />
                    Starting investment...
                  </>
                ) : (
                  <>
                    Confirm investment
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <p className="investment-disclaimer">
              This is an educational simulation.
              Returns shown are projections and
              are not guaranteed.
            </p>
          </div>
        </div>
      )}
    </AppShell>
  );
}