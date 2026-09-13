"use client";

import {
  Ban,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

type Withdrawal = {
  _id: string;
  status:
    | "processing"
    | "on_the_way"
    | "blocked";
  adminMessage: string;
  amount: number;
  cryptoAsset: string;
  updatedAt: string;
};

type ActiveNotification = {
  key: string;
  title: string;
  message: string;
  status: Withdrawal["status"];
  amount: number;
  cryptoAsset: string;
};

const defaultProcessingMessage =
  "Your withdrawal request is being reviewed.";

export function WithdrawalNotification() {
  const [
    notification,
    setNotification,
  ] = useState<ActiveNotification | null>(
    null
  );

  const checkNotifications =
    useCallback(async () => {
      try {
        const response = await fetch(
          `/api/withdrawals?notification=${Date.now()}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        const withdrawals: Withdrawal[] =
          data.withdrawals || [];

        const latestNotification =
          withdrawals.find(
            (withdrawal) =>
              withdrawal.status ===
                "blocked" ||
              withdrawal.status ===
                "on_the_way" ||
              (withdrawal.status ===
                "processing" &&
                Boolean(
                  withdrawal.adminMessage
                ) &&
                withdrawal.adminMessage !==
                  defaultProcessingMessage)
          );

        if (!latestNotification) {
          setNotification(null);
          return;
        }

        const notificationKey = [
          latestNotification._id,
          latestNotification.status,
          latestNotification.updatedAt,
        ].join("-");

        const wasSeen =
          window.localStorage.getItem(
            `novavest-notification-${notificationKey}`
          );

        if (wasSeen) {
          setNotification(null);
          return;
        }

        let title =
          "Message from administration";

        let message =
          latestNotification.adminMessage;

        if (
          latestNotification.status ===
          "on_the_way"
        ) {
          title =
            "Withdrawal approved";

          message =
            latestNotification.adminMessage ||
            "Your funds will be sent to your wallet shortly, typically within 30 minutes.";
        }

        if (
          latestNotification.status ===
          "blocked"
        ) {
          title =
            "Withdrawal unavailable";

          message =
            latestNotification.adminMessage ||
            "You cannot withdraw funds at the moment.";
        }

        setNotification({
          key: notificationKey,
          title,
          message,
          status:
            latestNotification.status,
          amount:
            latestNotification.amount,
          cryptoAsset:
            latestNotification.cryptoAsset,
        });
      } catch (error) {
        console.error(
          "Notification check error:",
          error
        );
      }
    }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void checkNotifications();

    const interval =
      window.setInterval(() => {
        void checkNotifications();
      }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, [checkNotifications]);

  function closeNotification() {
    if (!notification) {
      return;
    }

    window.localStorage.setItem(
      `novavest-notification-${notification.key}`,
      "seen"
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
      aria-labelledby="notification-title"
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
          className={`notification-icon notification-${notification.status}`}
        >
          {notification.status ===
          "on_the_way" ? (
            <CheckCircle2 size={30} />
          ) : notification.status ===
            "blocked" ? (
            <Ban size={30} />
          ) : (
            <Info size={30} />
          )}
        </div>

        <span className="panel-eyebrow">
           NOTIFICATION
        </span>

        <h2 id="notification-title">
          {notification.title}
        </h2>

        <p>{notification.message}</p>

        <div className="notification-details">
          <span>Request amount</span>

          <strong>
            $
            {notification.amount.toLocaleString(
              "en-US",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}{" "}
            {notification.cryptoAsset}
          </strong>
        </div>

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