"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  ReceiptText,
  Settings,
  Users,
} from "lucide-react";

import { brand } from "@/lib/brand";

type AppShellProps = {
  children: ReactNode;
  mode?: "user" | "admin";
};

export function AppShell({
  children,
  mode = "user",
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const userNavigation = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Deposit",
      href: "/dashboard/deposit",
      icon: ArrowDownToLine,
    },
    {
      label: "Withdraw",
      href: "/dashboard/withdraw",
      icon: ArrowUpFromLine,
    },
    {
      label: "Transactions",
      href: "/dashboard#transactions",
      icon: ReceiptText,
    },
    {
      label: "Settings",
      href: "/dashboard/profile",
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
      href: "/admin/users",
      icon: Users,
    },
    {
      label: "Deposits",
      href: "/admin/deposits",
      icon: ArrowDownToLine,
    },
    {
      label: "Withdrawals",
      href: "/admin/withdrawals",
      icon: ArrowUpFromLine,
    },
    {
      label: "Audit log",
      href: "/admin/audit-log",
      icon: ReceiptText,
    },
  ];

  const navigation =
    mode === "admin"
      ? adminNavigation
      : userNavigation;

  function linkIsActive(href: string) {
    const path = href.split("#")[0];

    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }

    if (path === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(path);
  }

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <main className="application">
      <div className="demo-banner">
        Educational demo · Balances are simulated
      </div>

      <aside className="sidebar">
        <Link href="/" className="brand sidebar-brand">
          <span className="brand-mark">
            {brand.shortName || "NV"}
          </span>

          <span>{brand.name}</span>
        </Link>

        <p className="sidebar-label">
          {mode === "admin"
            ? "Administration"
            : "Your account"}
        </p>

        <nav className="sidebar-navigation">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`sidebar-link ${
                  linkIsActive(item.href)
                    ? "active"
                    : ""
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="sidebar-link exit-link"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <LoaderCircle
              size={18}
              className="spin"
            />
          ) : (
            <LogOut size={18} />
          )}

          {loggingOut ? "Signing out..." : "Sign out"}
        </button>
      </aside>

      <div className="application-content">
        {children}
      </div>
    </main>
  );
}