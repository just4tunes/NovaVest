import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  Settings,
  Users,
} from "lucide-react";

import { brand } from "@/lib/brand";

type AppShellProps = {
  children: React.ReactNode;
  mode?: "user" | "admin";
};

export function AppShell({
  children,
  mode = "user",
}: AppShellProps) {
  const userNavigation = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Deposit",
      href: "/dashboard",
      icon: ArrowDownToLine,
    },
    {
      label: "Withdraw",
      href: "/dashboard",
      icon: ArrowUpFromLine,
    },
    {
      label: "Transactions",
      href: "/dashboard",
      icon: ReceiptText,
    },
    {
      label: "Settings",
      href: "/dashboard",
      icon: Settings,
    },
  ];

  const adminNavigation = [
    {
      label: "Overview",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Users",
      href: "/admin",
      icon: Users,
    },
    {
      label: "Deposits",
      href: "/admin",
      icon: ArrowDownToLine,
    },
    {
      label: "Withdrawals",
      href: "/admin",
      icon: ArrowUpFromLine,
    },
    {
      label: "Audit log",
      href: "/admin",
      icon: ReceiptText,
    },
  ];

  const navigation =
    mode === "admin" ? adminNavigation : userNavigation;

  return (
    <main className="application">
      <div className="demo-banner">
        Educational demo · Balances are simulated
      </div>

      <aside className="sidebar">
        <Link href="/" className="brand sidebar-brand">
          <span className="brand-mark">N</span>
          <span>{brand.name}</span>
        </Link>

        <p className="sidebar-label">
          {mode === "admin"
            ? "Administration"
            : "Your account"}
        </p>

        <nav className="sidebar-navigation">
          {navigation.map((item, index) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`sidebar-link ${
                  index === 0 ? "active" : ""
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/" className="sidebar-link exit-link">
          <LogOut size={18} />
          Exit demo
        </Link>
      </aside>

      <div className="application-content">
        {children}
      </div>
    </main>
  );
}