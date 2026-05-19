import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

type AuthTab = "login" | "register";

export default function AuthPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const next = searchParams.get("next") || "/";
  const requestedMode = searchParams.get("mode") === "login" ? "login" : "register";
  const [mode, setMode] = useState<AuthTab>(requestedMode);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    idNumber: "",
    username: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { isLoading, user, login, register } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      setLocation(next);
    }
  }, [isLoading, next, setLocation, user]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await login(loginForm);
      toast({
        title: "Welcome back",
        description: "You can carry on to the products now.",
      });
      setLocation(next);
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await register(registerForm);
      toast({
        title: "Account ready",
        description: "Your registration is complete and you are signed in.",
      });
      setLocation(next);
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto pt-6 md:pt-14 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start">
        <section className="space-y-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-primary/60">
            Registered access
          </p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[0.95]">
            Browse first.
            <br />
            Unlock the products when you are ready.
          </h1>
          <p className="max-w-xl text-sm md:text-base text-muted-foreground/80 font-mono leading-relaxed">
            The web app keeps browsing open, but products and checkout need a registered account.
            Installed wrappers stay signed in on this device. Regular web sessions ask you to log
            in again when you come back later.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary/60">
                Register
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Full name, ID number, username, and password.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary/60">
                Login
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Username and password only for returning users.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary/60">
                Pickup
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Orders are tied to the registered customer details on file.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-card/50 backdrop-blur-xl p-6 md:p-7 shadow-2xl shadow-black/25">
          <Tabs value={mode} onValueChange={(value) => setMode(value as AuthTab)}>
            <TabsList className="grid w-full grid-cols-2 h-11 bg-white/[0.04]">
              <TabsTrigger value="register" className="font-mono uppercase tracking-widest text-xs">
                Register
              </TabsTrigger>
              <TabsTrigger value="login" className="font-mono uppercase tracking-widest text-xs">
                Login
              </TabsTrigger>
            </TabsList>

            <TabsContent value="register" className="mt-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={registerForm.fullName}
                    onChange={(event) => setRegisterForm((current) => ({ ...current, fullName: event.target.value }))}
                    placeholder="Name and surname"
                    className="bg-background/60"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idNumber" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    ID Number
                  </Label>
                  <Input
                    id="idNumber"
                    value={registerForm.idNumber}
                    onChange={(event) => setRegisterForm((current) => ({ ...current, idNumber: event.target.value }))}
                    placeholder="South African ID number"
                    className="bg-background/60 font-mono"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registerUsername" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    Username
                  </Label>
                  <Input
                    id="registerUsername"
                    value={registerForm.username}
                    onChange={(event) => setRegisterForm((current) => ({ ...current, username: event.target.value }))}
                    placeholder="Choose a username"
                    className="bg-background/60"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registerPassword" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    Password
                  </Label>
                  <Input
                    id="registerPassword"
                    type="password"
                    value={registerForm.password}
                    onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                    placeholder="At least 6 characters"
                    className="bg-background/60"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 mt-2 font-mono uppercase tracking-[0.2em]"
                >
                  {isSubmitting ? "Creating account..." : "Register and continue"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loginUsername" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    Username
                  </Label>
                  <Input
                    id="loginUsername"
                    value={loginForm.username}
                    onChange={(event) => setLoginForm((current) => ({ ...current, username: event.target.value }))}
                    placeholder="Your username"
                    className="bg-background/60"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loginPassword" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    Password
                  </Label>
                  <Input
                    id="loginPassword"
                    type="password"
                    value={loginForm.password}
                    onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                    placeholder="Your password"
                    className="bg-background/60"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 mt-2 font-mono uppercase tracking-[0.2em]"
                >
                  {isSubmitting ? "Signing in..." : "Login"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </Layout>
  );
}
