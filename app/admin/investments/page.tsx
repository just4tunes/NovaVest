import {
  ChartNoAxesCombined,
} from "lucide-react";

import { AdminInvestments } from "@/components/admin-investments";
import { AppShell } from "@/components/app-shell";

export default function AdminInvestmentsPage() {
  return (
    <AppShell mode="admin">
      <header className="dashboard-header">
        <div>
          <p>Portfolio management</p>

          <h1>User investments</h1>

          <span>
            Manage projected returns, completed
            strategies and user notifications.
          </span>
        </div>

        <div className="avatar">
          <ChartNoAxesCombined size={20} />
        </div>
      </header>

      <AdminInvestments />
    </AppShell>
  );
}