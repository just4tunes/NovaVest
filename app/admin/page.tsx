import { AdminDashboard } from "@/components/admin-dashboard";
import { AppShell } from "@/components/app-shell";

export default function AdminPage() {
  return (
    <AppShell mode="admin">
      <AdminDashboard />
    </AppShell>
  );
}