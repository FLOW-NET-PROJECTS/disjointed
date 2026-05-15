import { useEffect } from "react";
import { useLocation } from "wouter";

export function AdminPinProtection({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const isUnlocked = sessionStorage.getItem("disjointed_admin_unlocked") === "true";
    if (!isUnlocked && location !== "/admin") {
      setLocation("/admin");
    }
  }, [location, setLocation]);

  return <>{children}</>;
}