"use client";

import {
  Ban,
  BriefcaseBusiness,
  CheckCircle2,
  TrendingUp,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type InvestmentStatus = "active" | "completed" | "cancelled";

type Investment = {
  _id: string;
  planName: string;
  amount: number;
  projectedReturn: number;
  actualProfit: number;
  status: InvestmentStatus;
  adminMessage: string;
  updatedAt: string;
};

type ActiveNotification = {
  key: string;
  title: string;
  message: string;
  status: InvestmentStatus;
  planName: string;
  amount: number;
  projectedReturn: number;
  actualProfit: number;
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount || 0);
}

export function InvestmentNotification() {
  const [notification, setNotification] = useState<ActiveNotification | null>(
    null,
  );

  const checkNotifications = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/investments?notification=${Date.now()}`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      const investments: Investment[] = data.investments || [];

      const sortedInvestments = [...investments].sort(
        (first, second) =>
          new Date(second.updatedAt).getTime() -
          new Date(first.updatedAt).getTime(),
      );

      const latestNotification = sortedInvestments.find((investment) => {
        const canNotify =
          investment.status === "completed" ||
          investment.status === "cancelled" ||
          Boolean(investment.adminMessage);

        if (!canNotify) {
          return false;
        }

        const candidateKey = [
          investment._id,
          investment.status,
          investment.updatedAt,
        ].join("-");

        const candidateStorageKey = `novavest-investment-notification-${candidateKey}`;

        return !window.localStorage.getItem(candidateStorageKey);
      });

      if (!latestNotification) {
        setNotification(null);
        return;
      }

      const notificationKey = [
        latestNotification._id,
        latestNotification.status,
        latestNotification.updatedAt,
      ].join("-");

      let title = "Investment update";

      let message =
        latestNotification.adminMessage ||
        "There is a new update for your investment.";

      if (latestNotification.status === "completed") {
        title = "Investment completed";

        message =
          latestNotification.adminMessage ||
          "Your investment has completed. Your capital and actual profit have been credited to your account.";
      }

      if (latestNotification.status === "cancelled") {
        title = "Investment cancelled";

        message =
          latestNotification.adminMessage ||
          "Your investment was cancelled and your original capital was returned to your deposit balance.";
      }

      if (
        latestNotification.status === "active" &&
        latestNotification.projectedReturn > 0
      ) {
        title = "Projected return updated";
      }

      setNotification({
        key: notificationKey,
        title,
        message,
        status: latestNotification.status,
        planName: latestNotification.planName,
        amount: latestNotification.amount,
        projectedReturn: latestNotification.projectedReturn || 0,
        actualProfit: latestNotification.actualProfit || 0,
      });
    } catch (error) {
      console.error("Investment notification error:", error);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void checkNotifications();

    const interval = window.setInterval(() => {
      void checkNotifications();
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [checkNotifications]);

  function closeNotification() {
    if (!notification) {
      return;
    }

    window.localStorage.setItem(
      `novavest-investment-notification-${notification.key}`,
      "seen",
    );

    setNotification(null);
  }

  if (!notification) {
    return null;
  }

  return (
    <div
      className="notification-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="investment-notification-title"
    >
      <div className="notification-card">
        <button
          type="button"
          className="notification-close"
          onClick={closeNotification}
          aria-label="Close notification"
        >
          <X size={20} />
        </button>

        <div
          className={`notification-icon investment-notification-${notification.status}`}
        >
          {notification.status === "completed" ? (
            <CheckCircle2 size={30} />
          ) : notification.status === "cancelled" ? (
            <Ban size={30} />
          ) : notification.projectedReturn > 0 ? (
            <TrendingUp size={30} />
          ) : (
            <BriefcaseBusiness size={30} />
          )}
        </div>

        <span className="panel-eyebrow">INVESTMENT NOTIFICATION</span>

        <h2 id="investment-notification-title">{notification.title}</h2>

        <p>{notification.message}</p>

        <div className="notification-details">
          <span>Investment plan</span>

          <strong>{notification.planName}</strong>
        </div>

        <div className="notification-details">
          <span>Amount invested</span>

          <strong>{formatMoney(notification.amount)}</strong>
        </div>

        {notification.status === "active" &&
          notification.projectedReturn > 0 && (
            <div className="notification-details">
              <span>Projected return</span>

              <strong>{formatMoney(notification.projectedReturn)}</strong>
            </div>
          )}

        {notification.status === "completed" && (
          <div className="notification-details">
            <span>Actual profit credited</span>

            <strong>{formatMoney(notification.actualProfit)}</strong>
          </div>
        )}

        <button
          type="button"
          className="dashboard-submit-button"
          onClick={closeNotification}
        >
          Okay, understood
        </button>
      </div>
    </div>
  );
}
