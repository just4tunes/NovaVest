import { WalletCards } from "lucide-react";

import { AdminWalletSettings } from "@/components/admin-wallet-settings";
import { AppShell } from "@/components/app-shell";

export default function AdminWalletsPage() {
  return (
    <AppShell mode="admin">
      <header className="dashboard-header">
        <div>
          <p>Deposit configuration</p>
          <h1>Crypto wallets</h1>

          <span>
            Manage the demo/testnet wallet methods
            shown to users.
          </span>
        </div>

        <div className="avatar">
          <WalletCards size={20} />
        </div>
      </header>

      <AdminWalletSettings />
    </AppShell>
  );
}