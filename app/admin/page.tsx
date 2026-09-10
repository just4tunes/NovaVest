import {
  Check,
  Clock3,
  DollarSign,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";

const requests = [
  {
    name: "Maya Chen",
    amount: "$3,000",
    type: "Deposit",
    time: "8 minutes ago",
  },
  {
    name: "Daniel Reed",
    amount: "$1,250",
    type: "Withdrawal",
    time: "24 minutes ago",
  },
  {
    name: "Sara Jones",
    amount: "$5,500",
    type: "Deposit",
    time: "1 hour ago",
  },
];

const metrics = [
  { label: "Total users", value: "1,284", icon: Users },
  { label: "Demo balances", value: "$248,640", icon: DollarSign },
  { label: "Pending requests", value: "12", icon: Clock3 },
  { label: "Active today", value: "48", icon: UserRound },
];

export default function AdminPage() {
  return (
    <AppShell mode="admin">
      <header className="dashboard-header">
        <div>
          <p>Demo operations</p>
          <h1>Admin overview</h1>
        </div>

        <div className="avatar">FK</div>
      </header>

      <section className="admin-metrics">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article className="summary-card" key={metric.label}>
              <div className="card-icon">
                <Icon size={20} />
              </div>

              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </article>
          );
        })}
      </section>

      <section className="table-card admin-table">
        <div className="card-heading">
          <div>
            <h2>Requests needing review</h2>
            <p>Approve or reject simulated account activity</p>
          </div>

          <span className="pending-count">12 pending</span>
        </div>

        <div className="table-wrapper">
          <table>
            <tbody>
              {requests.map((request) => (
                <tr key={request.name}>
                  <td>
                    <div className="user-information">
                      <span className="small-avatar">
                        {request.name
                          .split(" ")
                          .map((name) => name[0])
                          .join("")}
                      </span>

                      <div>
                        <strong>{request.name}</strong>
                        <span>{request.time}</span>
                      </div>
                    </div>
                  </td>

                  <td>{request.type}</td>
                  <td>{request.amount}</td>

                  <td>
                    <div className="request-actions">
                      <button aria-label="Reject request">
                        <X size={16} />
                      </button>

                      <button
                        className="approve-button"
                        aria-label="Approve request"
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}