"use client";

import { useEffect } from "react";

const revealSelector = [
  ".dashboard-header",
  ".account-balance-card",
  ".dashboard-panel",
  ".summary-card",
  ".brokerage-section-heading",
  ".market-watchlist-row",
  ".quick-action-list > a",
  ".admin-live-table tbody tr",
  ".user-transaction-table tbody tr",
].join(", ");

export function DashboardScrollAnimations() {
  useEffect(() => {
    const observedElements = new WeakSet<Element>();

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle(
            "scroll-reveal-visible",
            entry.isIntersecting
          );
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px",
      }
    );

    function observeElements() {
      const elements =
        document.querySelectorAll(revealSelector);

      elements.forEach((element, index) => {
        if (observedElements.has(element)) {
          return;
        }

        observedElements.add(element);
        element.classList.add("scroll-reveal");

        if (element instanceof HTMLElement) {
          element.style.setProperty(
            "--reveal-delay",
            `${Math.min(index % 5, 4) * 70}ms`
          );
        }

        intersectionObserver.observe(element);
      });
    }

    observeElements();

    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      mutationObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, []);

  return null;
}