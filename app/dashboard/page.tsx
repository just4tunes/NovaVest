import {
  ArrowDownToLine,
  ArrowUpRight,
  Eye,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { brand } from "@/lib/brand";

const transactions = [
  {
    name: "Demo deposit",
    date: "September 7, 2026",
    amount: "+$5,000.00",
    status: "Completed",
  },
  {
    name: "Growth plan",
    date: "September 6, 2026",
    amount: "-$2,500.00",
    status: "Active",
  },
  {
    name: "Demo earnings",
    date: "September 5, 2026",
    amount: "+$184.20",
    status: "Completed",
  },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <header className="dashboard-header">
        <div>
          <p>Sunday, September 7</p>
          <h1>Good afternoon, Alex</h1>
        </div>

        <div className="avatar">AT</div>
      </header>

      <section className="dashboard-cards">
        <article className="balance-card">
          <div className="balance-card-heading">
            <span>Available demo balance</span>
            <Eye size={18} />
          </div>

          <h2>{brand.currencySymbol}12,480.50</h2>

          <div className="balance-actions">
            <button>
              <ArrowDownToLine size={17} />
              Deposit
            </button>

            <button>
              <ArrowUpRight size={17} />
              Withdraw
            </button>
          </div>
        </article>

        <article className="summary-card">
          <div className="card-icon">
            <TrendingUp size={20} />
          </div>

          <span>Total earnings</span>
          <strong>+$1,284.20</strong>
          <small>+8.4% this month</small>
        </article>

        <article className="summary-card">
          <div className="card-icon">
            <Wallet size={20} />
          </div>

          <span>Active investment</span>
          <strong>$7,500.00</strong>
          <small>Across 3 demo plans</small>
        </article>
      </section>

      <section className="dashboard-lower-grid">
        <article className="table-card">
          <div className="card-heading">
            <div>
              <h2>Recent activity</h2>
              <p>Your latest demo transactions</p>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.name}>
                    <td>
                      <strong>{transaction.name}</strong>
                      <span>{transaction.date}</span>
                    </td>

                    <td>{transaction.amount}</td>

                    <td>
                      <span
                        className={`status ${
                          transaction.status === "Active"
                            ? "status-active"
                            : ""
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="table-card plan-card">
          <div className="card-heading">
            <div>
              <h2>Plan progress</h2>
              <p>Balanced growth</p>
            </div>
          </div>

          <div className="progress-circle">
            <span>64%</span>
          </div>

          <div className="plan-details">
            <span>Invested</span>
            <strong>$2,500 / $3,900</strong>
          </div>
        </article>
      </section>
    </AppShell>
  );
}