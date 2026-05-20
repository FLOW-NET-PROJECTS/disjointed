import { useEffect } from "react";

export function useManifest(variant: "shop" | "admin") {
  useEffect(() => {
    const href = variant === "admin" ? "/admin-manifest.json" : "/shop-manifest.json";
    const existing = document.querySelector<HTMLLinkElement>(
      "link[data-app-manifest='true'], link[rel='manifest']",
    );

    if (existing) {
      existing.href = href;
      existing.dataset.appManifest = "true";
    } else {
      const link = document.createElement("link");
      link.rel = "manifest";
      link.href = href;
      link.dataset.appManifest = "true";
      document.head.appendChild(link);
    }
  }, [variant]);
}
