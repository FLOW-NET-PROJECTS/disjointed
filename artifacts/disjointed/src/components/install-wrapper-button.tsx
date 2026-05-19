import { useEffect, useMemo, useState } from "react";
import { Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [guideOpen, setGuideOpen] = useState(false);
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
  const installPagePath = variant === "admin" ? "/admin" : "/";
  const installUrl =
    typeof window === "undefined"
      ? installPagePath
      : new URL(installPagePath, window.location.origin).toString();

  const guide = useMemo(() => {
    if (typeof window === "undefined") {
      return {
        title: "Install from your browser menu",
        description: "Open this page in Chrome, Edge, or Safari and use the browser install option.",
        steps: [
          "Chrome or Edge: open the browser menu and choose Install app.",
          "Safari on iPhone or iPad: tap Share, then Add to Home Screen.",
        ],
      };
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|edg|android/.test(userAgent);

    if (isIos && isSafari) {
      return {
        title: "Install from Safari",
        description: "Apple does not show a direct install popup here, so Safari needs the share-sheet flow.",
        steps: [
          "Tap the Share button in Safari.",
          "Choose Add to Home Screen.",
          `Open ${variant === "admin" ? "the admin" : "the shop"} from the new icon after Safari saves it.`,
        ],
      };
    }

    if (isAndroid) {
      return {
        title: "Install from your browser menu",
        description: "Android sometimes hides the install prompt until the browser decides the app is installable.",
        steps: [
          "Tap the browser menu in Chrome or Edge.",
          "Choose Install app or Add to Home screen.",
          `If the prompt still stays hidden, open ${installUrl} and try again from there.`,
        ],
      };
    }

    return {
      title: "Install from your browser",
      description: "Desktop browsers sometimes keep the native install prompt behind the address bar or the browser menu.",
      steps: [
        "Look for the install icon at the right side of the address bar.",
        "If you do not see it, open the browser menu and choose Install app.",
        `If needed, open ${installUrl} in a fresh tab and install from that page.`,
      ],
    };
  }, [installUrl, variant]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      setGuideOpen(true);
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
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleInstall}
        className={className}
      >
        <Download className="w-4 h-4 mr-2" />
        {label}
      </Button>

      <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
        <DialogContent className="border-border/60 bg-background/95 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase tracking-[0.25em] text-sm text-primary">
              {label}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {guide.description}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
            <p className="font-semibold text-foreground">{guide.title}</p>
            <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
              {guide.steps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-[11px] text-primary">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              className="font-mono uppercase tracking-widest text-xs"
              onClick={async () => {
                try {
                  if (!navigator.clipboard?.writeText) {
                    throw new Error("Clipboard API unavailable");
                  }

                  await navigator.clipboard.writeText(installUrl);
                  toast({
                    title: "Install link copied",
                    description: "Open it in a fresh tab if your browser keeps hiding the install option.",
                  });
                } catch {
                  toast({
                    title: "Copy failed",
                    description: "Open the install page directly from the button on the right.",
                    variant: "destructive",
                  });
                }
              }}
            >
              Copy Install Link
            </Button>
            <Button
              type="button"
              className="font-mono uppercase tracking-widest text-xs"
              onClick={() => {
                setGuideOpen(false);
                window.location.assign(installPagePath);
              }}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Install Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
