import { useEffect } from "react";

export function useScrollReveal(selector, dependencyKey = "") {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll(selector));
    if (targets.length === 0) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -5% 0px" }
    );

    targets.forEach((target) => {
      if (!target.classList.contains("is-visible")) {
        observer.observe(target);
      }
    });

    return () => observer.disconnect();
  }, [selector, dependencyKey]);
}
