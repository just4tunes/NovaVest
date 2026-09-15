"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const inactivityLimit =
  15 * 60 * 1000;

const activityStorageKey =
  "novavest-last-activity";

export function InactivityLogout() {
  const router = useRouter();

  useEffect(() => {
    let timeoutId: number;
    let logoutStarted = false;
    let lastRecordedActivity = 0;

    async function logOutUser() {
      if (logoutStarted) {
        return;
      }

      logoutStarted = true;

      try {
        await fetch("/api/auth/logout", {
          method: "POST",
        });
      } finally {
        window.localStorage.removeItem(
          activityStorageKey
        );

        router.replace(
          "/login?reason=inactive"
        );

        router.refresh();
      }
    }

    function scheduleLogout() {
      window.clearTimeout(timeoutId);

      const storedActivity =
        window.localStorage.getItem(
          activityStorageKey
        );

      const lastActivity = storedActivity
        ? Number(storedActivity)
        : Date.now();

      const inactiveDuration =
        Date.now() - lastActivity;

      const remainingTime =
        inactivityLimit - inactiveDuration;

      if (remainingTime <= 0) {
        void logOutUser();
        return;
      }

      timeoutId = window.setTimeout(() => {
        void logOutUser();
      }, remainingTime);
    }

    function recordActivity() {
      const now = Date.now();

      if (
        now - lastRecordedActivity <
        1000
      ) {
        return;
      }

      lastRecordedActivity = now;

      window.localStorage.setItem(
        activityStorageKey,
        String(now)
      );

      scheduleLogout();
    }

    function checkActivityWhenVisible() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        scheduleLogout();
      }
    }

    function synchronizeActivity(
      event: StorageEvent
    ) {
      if (
        event.key === activityStorageKey
      ) {
        scheduleLogout();
      }
    }

    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "pointerdown",
    ] as const;

    window.localStorage.setItem(
      activityStorageKey,
      String(Date.now())
    );

    activityEvents.forEach((eventName) => {
      window.addEventListener(
        eventName,
        recordActivity,
        {
          passive: true,
        }
      );
    });

    document.addEventListener(
      "visibilitychange",
      checkActivityWhenVisible
    );

    window.addEventListener(
      "storage",
      synchronizeActivity
    );

    scheduleLogout();

    return () => {
      window.clearTimeout(timeoutId);

      activityEvents.forEach(
        (eventName) => {
          window.removeEventListener(
            eventName,
            recordActivity
          );
        }
      );

      document.removeEventListener(
        "visibilitychange",
        checkActivityWhenVisible
      );

      window.removeEventListener(
        "storage",
        synchronizeActivity
      );
    };
  }, [router]);

  return null;
}