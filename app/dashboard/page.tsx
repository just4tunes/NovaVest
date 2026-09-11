import { AppShell } from "@/components/app-shell";
import { UserDashboard } from "@/components/user-dashboard";

export default function DashboardPage() {
  return (
    <AppShell mode="user">
      <UserDashboard />
    </AppShell>
  );
}