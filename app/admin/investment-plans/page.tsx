import { BriefcaseBusiness } from "lucide-react";

import { AdminInvestmentPlans } from "@/components/admin-investment-plans";
import { AppShell } from "@/components/app-shell";

export default function AdminInvestmentPlansPage() {
  return (
    <AppShell mode="admin">
      <header className="dashboard-header">
        <div>
          <p>Portfolio configuration</p>

          <h1>Investment plans</h1>

          <span>
            Create and manage the simulated
            investment strategies shown to users.
          </span>
        </div>

        <div className="avatar">
          <BriefcaseBusiness size={20} />
        </div>
      </header>

      <AdminInvestmentPlans />
    </AppShell>
  );
}