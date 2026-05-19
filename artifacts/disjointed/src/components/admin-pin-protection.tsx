import { useEffect } from "react";
import { useLocation } from "wouter";
import { isAdminUnlocked } from "@/lib/admin-access";

export function AdminPinProtection({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isAdminUnlocked() && location !== "/admin") {
      setLocation("/admin");
    }
  }, [location, setLocation]);

  return <>{children}</>;
}
