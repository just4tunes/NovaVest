import { redirect } from "next/navigation";

import { InvestmentNotification } from "@/components/investment-notification";
import { WithdrawalNotification } from "@/components/withdrawal-notification";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "admin") {
    redirect("/admin");
  }

  return (
    <>
      {children}
      <WithdrawalNotification />
      <InvestmentNotification />
    </>
  );
}