"use client";

import {
  CheckCircle2,
  LoaderCircle,
  ShieldAlert,
  UserRound,
  Users,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { AppShell } from "@/components/app-shell";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  accountStatus:
    | "active"
    | "suspended";
  depositBalance: number;
  profitBalance: number;
  totalBalance: number;
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
    .map((word) =>
      word[0].toUpperCase()
    )
    .join("");
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<
    AdminUser[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [workingId, setWorkingId] =
    useState("");

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const loadUsers = useCallback(
    async () => {
      try {
        setError("");

        const response = await fetch(
          `/api/admin/users?refresh=${Date.now()}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load users."
          );
        }

        setUsers(data.users || []);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load users."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadUsers();
  }, [loadUsers]);

  async function changeUserStatus(
    user: AdminUser
  ) {
    const newStatus =
      user.accountStatus === "active"
        ? "suspended"
        : "active";

    const confirmed = window.confirm(
      newStatus === "suspended"
        ? `Suspend ${user.name}'s account?`
        : `Reactivate ${user.name}'s account?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setWorkingId(user.id);
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/admin/users/${user.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            accountStatus: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update user."
        );
      }

      setMessage(data.message);
      await loadUsers();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update user."
      );
    } finally {
      setWorkingId("");
    }
  }

  const activeUsers = users.filter(
    (user) =>
      user.accountStatus === "active"
  ).length;

  const suspendedUsers = users.filter(
    (user) =>
      user.accountStatus ===
      "suspended"
  ).length;

  return (
    <AppShell mode="admin">
      <header className="dashboard-header">
        <div>
          <p>User administration</p>
          <h1>User accounts</h1>

          <span>
            View balances and manage account
            access.
          </span>
        </div>

        <div className="avatar">
          <Users size={20} />
        </div>
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
            <CheckCircle2 size={20} />
          </div>

          <strong>{activeUsers}</strong>
          <span>Active users</span>
        </article>

        <article className="summary-card">
          <div className="card-icon">
            <ShieldAlert size={20} />
          </div>

          <strong>{suspendedUsers}</strong>
          <span>Suspended users</span>
        </article>
      </section>

      <section className="dashboard-panel admin-section">
        <div className="panel-heading">
          <div>
            <span className="panel-eyebrow">
              User management
            </span>

            <h2>Registered users</h2>

            <p>
              Suspend or reactivate user
              accounts.
            </p>
          </div>

          <button
            type="button"
            className="receipt-button"
            onClick={() =>
              void loadUsers()
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

            <p>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="admin-empty-state">
            <UserRound size={28} />

            <h3>No users found</h3>

            <p>
              Registered user accounts will
              appear here.
            </p>
          </div>
        ) : (
          <div className="responsive-table">
            <table className="admin-live-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Deposit</th>
                  <th>Profit</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-user-cell">
                        <span className="small-avatar">
                          {getInitials(
                            user.name
                          )}
                        </span>

                        <span>
                          <strong>
                            {user.name}
                          </strong>

                          <small>
                            {user.email}
                          </small>
                        </span>
                      </div>
                    </td>

                    <td>
                      {formatMoney(
                        user.depositBalance
                      )}
                    </td>

                    <td>
                      {formatMoney(
                        user.profitBalance
                      )}
                    </td>

                    <td>
                      <strong>
                        {formatMoney(
                          user.totalBalance
                        )}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`status ${
                          user.accountStatus ===
                          "active"
                            ? "status-active"
                            : "status-rejected"
                        }`}
                      >
                        {user.accountStatus}
                      </span>
                    </td>

                    <td>
                      {new Date(
                        user.createdAt
                      ).toLocaleDateString()}
                    </td>

                    <td>
                      <button
                        type="button"
                        className={
                          user.accountStatus ===
                          "suspended"
                            ? "receipt-button approve-button"
                            : "receipt-button"
                        }
                        disabled={
                          workingId === user.id
                        }
                        onClick={() =>
                          changeUserStatus(user)
                        }
                      >
                        {workingId ===
                        user.id ? (
                          <LoaderCircle
                            className="spin"
                            size={16}
                          />
                        ) : user.accountStatus ===
                          "active" ? (
                          <ShieldAlert
                            size={16}
                          />
                        ) : (
                          <CheckCircle2
                            size={16}
                          />
                        )}

                        {user.accountStatus ===
                        "active"
                          ? "Suspend"
                          : "Reactivate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}