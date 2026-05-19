import { useEffect } from "react";

export function useManifest(variant: "shop" | "admin") {
  useEffect(() => {
    const existing = document.querySelector("link[rel='manifest']");
    const href = variant === "admin" ? "/admin-manifest.json" : "/shop-manifest.json";

    if (existing) {
      existing.setAttribute("href", href);
    } else {
      const link = document.createElement("link");
      link.rel = "manifest";
      link.href = href;
      document.head.appendChild(link);
    }

    return () => {
      const el = document.querySelector("link[rel='manifest']");
      if (el) el.setAttribute("href", "/shop-manifest.json");
    };
  }, [variant]);
}
