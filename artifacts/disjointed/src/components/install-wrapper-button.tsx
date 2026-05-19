import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { isWrapperMode } from "@/lib/auth";

type DeferredInstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function InstallWrapperButton({
  variant,
  className,
}: {
  variant: "shop" | "admin";
  className?: string;
}) {
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredInstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setInstalled(isWrapperMode());

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as DeferredInstallPrompt);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (installed) {
    return null;
  }

  const label = variant === "admin" ? "Install Admin App" : "Install Shop App";

  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast({
        title: label,
        description:
          variant === "admin"
            ? "Use your browser install menu while you are on the admin portal page."
            : "Use your browser install menu while you are on the shop page.",
      });
      return;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    toast({
      title: choice.outcome === "accepted" ? "Wrapper install started" : "Install dismissed",
      description:
        choice.outcome === "accepted"
          ? variant === "admin"
            ? "The admin wrapper will open from its own portal entry point."
            : "The shop wrapper will open from the storefront entry point."
          : "You can install it again any time from this page.",
    });

    setDeferredPrompt(null);
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleInstall}
      className={className}
    >
      <Download className="w-4 h-4 mr-2" />
      {label}
    </Button>
  );
}
