import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { buildAuthPath } from "@/lib/auth";

export function ProtectedRoute({
  children,
  mode = "register",
}: {
  children: React.ReactNode;
  mode?: "login" | "register";
}) {
  const { isLoading, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading || user) {
      return;
    }

    const next = `${window.location.pathname}${window.location.search}`;
    setLocation(buildAuthPath(next, mode));
  }, [isLoading, mode, setLocation, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground font-mono text-sm uppercase tracking-[0.3em]">
        Checking access
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
