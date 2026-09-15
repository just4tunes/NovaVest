"use client";

import { useEffect } from "react";

const landingRevealSelector = [
  ".home-section-heading",
  ".home-statistics > div",
  ".home-step-grid > article",
  ".home-market-chart-card",
  ".home-watchlist-card",
  ".home-watchlist > div",
  ".home-property-visual",
  ".home-check-list > li",
  ".home-about-card",
  ".home-terminal",
  ".home-services-grid > article",
  ".home-hallmarks-grid > article",
  ".home-plans-preview",
  ".home-final-cta .home-container",
].join(", ");

export function LandingScrollAnimations() {
  useEffect(() => {
    const observedElements =
      new WeakSet<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle(
            "home-reveal-visible",
            entry.isIntersecting
          );
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -45px 0px",
      }
    );

    function observeLandingElements() {
      const elements =
        document.querySelectorAll(
          landingRevealSelector
        );

      elements.forEach((element, index) => {
        if (observedElements.has(element)) {
          return;
        }

        observedElements.add(element);
        element.classList.add("home-reveal");

        if (element instanceof HTMLElement) {
          element.style.setProperty(
            "--home-reveal-delay",
            `${(index % 4) * 80}ms`
          );
        }

        observer.observe(element);
      });
    }

    observeLandingElements();

    const mutationObserver =
      new MutationObserver(() => {
        observeLandingElements();
      });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, []);

  return null;
}