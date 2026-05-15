import { useState } from "react";
import { useLocation } from "wouter";
import { ShieldAlert, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import logoUrl from "@assets/1000377908_1778876362934.jpg";

export default function AdminPin() {
  const [pin, setPin] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (pin === "2026") {
      sessionStorage.setItem("disjointed_admin_unlocked", "true");
      setLocation("/admin/dashboard");
      toast({
        title: "Access Granted",
        description: "Welcome to the admin portal.",
      });
    } else {
      setPin("");
      toast({
        title: "Access Denied",
        description: "Incorrect PIN.",
        variant: "destructive"
      });
    }
  };

  // Auto-submit when 4 digits are entered
  if (pin.length === 4) {
    setTimeout(() => handleSubmit(), 100);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 selection:bg-primary/30 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-xs z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-10">
          <div className="h-20 w-20 overflow-hidden rounded-full border border-primary/30 mb-6 shadow-[0_0_30px_-5px_rgba(74,140,63,0.3)]">
            <img src={logoUrl} alt="DISJOINTED Logo" className="h-full w-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold tracking-[0.2em] text-foreground mb-1">DISJOINTED</h1>
          <p className="text-[0.65rem] tracking-[0.3em] text-primary uppercase font-mono">Admin Portal</p>
        </div>

        <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-center gap-4 mb-10">
            {[0, 1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  i < pin.length ? "bg-primary shadow-[0_0_10px_rgba(74,140,63,0.8)] scale-110" : "bg-muted/50"
                }`}
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleKeyPress(num.toString())}
                className="h-16 rounded-xl bg-muted/20 border border-border/30 text-2xl font-mono hover:bg-primary/20 hover:border-primary/50 hover:text-primary transition-all active:scale-95"
              >
                {num}
              </button>
            ))}
            <div /> {/* Empty space */}
            <button
              onClick={() => handleKeyPress("0")}
              className="h-16 rounded-xl bg-muted/20 border border-border/30 text-2xl font-mono hover:bg-primary/20 hover:border-primary/50 hover:text-primary transition-all active:scale-95"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="h-16 rounded-xl bg-muted/20 border border-border/30 flex items-center justify-center text-muted-foreground hover:bg-destructive/20 hover:border-destructive/50 hover:text-destructive transition-all active:scale-95"
            >
              <Delete className="w-6 h-6" />
            </button>
          </div>
          
          <div className="mt-8 text-center">
            <Button 
              variant="link" 
              onClick={() => setLocation("/")}
              className="text-muted-foreground font-mono text-xs uppercase tracking-widest hover:text-foreground"
            >
              Return to Shop
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}