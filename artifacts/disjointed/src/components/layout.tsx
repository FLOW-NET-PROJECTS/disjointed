import { Link, useLocation } from "wouter";
import { ShoppingBag, Menu, X, LogOut, UserRound } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useManifest } from "@/hooks/use-manifest";
import { SmokeBg } from "@/components/smoke-bg";
import { useAuth } from "@/components/auth-provider";
import { InstallWrapperButton } from "@/components/install-wrapper-button";
import { buildAuthPath } from "@/lib/auth";
import logoUrl from "@assets/logo.jpg";

export function Layout({ children }: { children: React.ReactNode }) {
  useManifest("shop");

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartItemsCount = useCart((state) => state.getCartItemsCount());
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const toggleMenu = () => setIsMobileMenuOpen((current) => !current);
  const closeMenu = () => setIsMobileMenuOpen(false);

  const ordersHref = user ? "/orders" : buildAuthPath("/orders", "login");
  const cartHref = user ? "/cart" : buildAuthPath("/cart", "login");
  const loginHref = buildAuthPath("/", "login");
  const registerHref = buildAuthPath("/", "register");

  const handleLogout = async () => {
    await logout();
    closeMenu();
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30 relative">
      <SmokeBg />

      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-foreground/70 hover:text-foreground"
              onClick={toggleMenu}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            <Link href="/" className="flex items-center gap-3 group" onClick={closeMenu}>
              <div className="h-9 w-9 overflow-hidden rounded-full border border-primary/30 group-hover:border-primary/70 transition-all duration-300 shadow-[0_0_12px_-2px_rgba(74,140,63,0.3)] group-hover:shadow-[0_0_18px_-2px_rgba(74,140,63,0.5)]">
                <img src={logoUrl} alt="DISJOINTED Logo" className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-bold tracking-[0.18em] text-base leading-tight group-hover:text-primary transition-colors duration-300">
                  DISJOINTED
                </span>
                <span className="text-[0.55rem] tracking-[0.25em] text-primary/50 uppercase leading-none font-mono">
                  LIFESTYLE
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link
              href="/"
              className={`transition-all duration-200 tracking-wide hover:text-primary relative after:absolute after:bottom-[-2px] after:left-0 after:h-px after:bg-primary after:transition-all after:duration-300 ${
                location === "/" ? "text-primary after:w-full" : "text-foreground/60 after:w-0 hover:after:w-full"
              }`}
            >
              Shop
            </Link>
            <Link
              href={ordersHref}
              className={`transition-all duration-200 tracking-wide hover:text-primary relative after:absolute after:bottom-[-2px] after:left-0 after:h-px after:bg-primary after:transition-all after:duration-300 ${
                location.startsWith("/orders") ? "text-primary after:w-full" : "text-foreground/60 after:w-0 hover:after:w-full"
              }`}
            >
              Orders
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <InstallWrapperButton
              variant="shop"
              className="hidden lg:inline-flex font-mono uppercase tracking-widest text-[11px]"
            />

            {user ? (
              <div className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                <UserRound className="w-4 h-4 text-primary/80" />
                <span className="font-mono text-xs text-foreground/80 max-w-28 truncate">
                  {user.username}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href={loginHref}
                  className="px-3 py-2 rounded-lg border border-white/10 text-xs font-mono uppercase tracking-widest text-foreground/70 hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href={registerHref}
                  className="px-3 py-2 rounded-lg bg-primary/15 border border-primary/25 text-xs font-mono uppercase tracking-widest text-primary hover:bg-primary/25 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            <Link href={cartHref} className="relative group p-2 rounded-lg hover:bg-white/5 transition-colors">
              <ShoppingBag
                className={`h-5 w-5 transition-colors group-hover:text-primary ${
                  location === "/cart" ? "text-primary" : "text-foreground/70"
                }`}
              />
              {cartItemsCount > 0 && (
                <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-primary text-[9px] font-bold flex items-center justify-center text-primary-foreground shadow-[0_0_8px_rgba(74,140,63,0.6)]">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl absolute top-16 left-0 w-full animate-in slide-in-from-top-2 duration-200">
            <div className="container mx-auto px-4 py-5 flex flex-col gap-2">
              <Link
                href="/"
                className={`text-sm font-medium px-3 py-2.5 rounded-lg transition-colors ${
                  location === "/" ? "text-primary bg-primary/10" : "text-foreground/70 hover:bg-white/5 hover:text-foreground"
                }`}
                onClick={closeMenu}
              >
                Shop
              </Link>
              <Link
                href={ordersHref}
                className={`text-sm font-medium px-3 py-2.5 rounded-lg transition-colors ${
                  location.startsWith("/orders") ? "text-primary bg-primary/10" : "text-foreground/70 hover:bg-white/5 hover:text-foreground"
                }`}
                onClick={closeMenu}
              >
                Orders
              </Link>

              {!user ? (
                <>
                  <Link
                    href={registerHref}
                    className="text-sm font-medium px-3 py-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20"
                    onClick={closeMenu}
                  >
                    Register
                  </Link>
                  <Link
                    href={loginHref}
                    className="text-sm font-medium px-3 py-2.5 rounded-lg text-foreground/70 hover:bg-white/5 hover:text-foreground"
                    onClick={closeMenu}
                  >
                    Login
                  </Link>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-left text-sm font-medium px-3 py-2.5 rounded-lg text-foreground/70 hover:bg-white/5 hover:text-foreground"
                >
                  Sign out
                </button>
              )}

              <InstallWrapperButton
                variant="shop"
                className="justify-start font-mono uppercase tracking-widest text-xs mt-1"
              />
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10 flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>

      <footer className="relative z-10 border-t border-white/5 bg-background/60 backdrop-blur-sm py-8 mt-16">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 overflow-hidden rounded-full border border-border/30 opacity-50">
              <img src={logoUrl} alt="DISJOINTED Logo" className="h-full w-full object-cover grayscale" />
            </div>
            <p className="text-xs text-muted-foreground/50 font-mono tracking-wide">
              &copy; {new Date().getFullYear()} DISJOINTED LIFESTYLE
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground/30 font-mono tracking-widest uppercase">
            For adults 18+ only - consume responsibly
          </p>
        </div>
      </footer>
    </div>
  );
}
