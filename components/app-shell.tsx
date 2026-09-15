"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  ReceiptText,
  Settings,
  UserRound,
  Users,
  WalletCards,
  Globe2,
} from "lucide-react";

import { brand } from "@/lib/brand";

type AppShellProps = {
  children: ReactNode;
  mode?: "user" | "admin";
};

export function AppShell({ children, mode = "user" }: AppShellProps) {
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
      label: "Investments",
      href: "/dashboard/investments",
      icon: BriefcaseBusiness,
    },
    {
      label: "Transactions",
      href: "/dashboard/transactions",
      icon: ReceiptText,
    },
    {
      label: "Settings",
      href: "/dashboard/profile",
      icon: Settings,
    },
  ];

  const mobileUserNavigation = [
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
      label: "Invest",
      href: "/dashboard/investments",
      icon: BriefcaseBusiness,
    },
    {
      label: "Withdraw",
      href: "/dashboard/withdraw",
      icon: ArrowUpFromLine,
    },
    {
      label: "Account",
      href: "/dashboard/profile",
      icon: UserRound,
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
      label: "Wallets",
      href: "/admin/wallets",
      icon: WalletCards,
    },
    {
      label: "Investment plans",
      href: "/admin/investment-plans",
      icon: BriefcaseBusiness,
    },
    {
      label: "Investments",
      href: "/admin/investments",
      icon: ChartNoAxesCombined,
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

  const navigation = mode === "admin" ? adminNavigation : userNavigation;

  function linkIsActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
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
    <main className={`application application-${mode}`}>
      <aside className="sidebar">
        <Link href="/" className="brand sidebar-brand">
          <span className="brand-mark">{brand.shortName || "NV"}</span>

          <span>{brand.name}</span>
        </Link>

        <p className="sidebar-label">
          {mode === "admin" ? "Administration" : "Your account"}
        </p>

        <nav className="sidebar-navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = linkIsActive(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`sidebar-link ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
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
            <LoaderCircle size={18} className="spin" />
          ) : (
            <LogOut size={18} />
          )}

          {loggingOut ? "Signing out..." : "Sign out"}
        </button>
      </aside>

      <div className="application-content">
        {mode === "user" && (
          <div className="dashboard-website-row">
            <Link href="/" className="dashboard-website-link">
              <Globe2 size={16} />
              Back to website
            </Link>
          </div>
        )}

        {children}
      </div>

      {mode === "user" && (
        <nav
          className="mobile-bottom-navigation"
          aria-label="Mobile account navigation"
        >
          {mobileUserNavigation.map((item) => {
            const Icon = item.icon;
            const active = linkIsActive(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={active ? "active" : ""}
                aria-current={active ? "page" : undefined}
              >
                <span className="mobile-nav-icon">
                  <Icon size={21} />
                </span>

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </main>
  );
}
