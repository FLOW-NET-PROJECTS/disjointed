import { Link, useLocation } from "wouter";
import { ShoppingBag, Menu, X, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useManifest } from "@/hooks/use-manifest";
import logoUrl from "@assets/1000377908_1778876362934.jpg";

export function Layout({ children }: { children: React.ReactNode }) {
  useManifest("shop");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartItemsCount = useCart((state) => state.getCartItemsCount());
  const [location] = useLocation();

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            <Link href="/" className="flex items-center gap-3 group" onClick={closeMenu}>
              <div className="h-10 w-10 overflow-hidden rounded-full border border-border/50 group-hover:border-primary/50 transition-colors">
                <img src={logoUrl} alt="DISJOINTED Logo" className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-bold tracking-widest text-lg leading-tight group-hover:text-primary transition-colors">DISJOINTED</span>
                <span className="text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase leading-none">—LIFESTYLE—</span>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className={`transition-colors hover:text-primary ${location === '/' ? 'text-primary' : 'text-foreground/80'}`}>Shop</Link>
            <Link href="/orders" className={`transition-colors hover:text-primary ${location.startsWith('/orders') ? 'text-primary' : 'text-foreground/80'}`}>Orders</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative group p-2">
              <ShoppingBag className={`h-6 w-6 transition-colors group-hover:text-primary ${location === '/cart' ? 'text-primary' : 'text-foreground/80'}`} />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-border/40 bg-background absolute top-16 left-0 w-full animate-in slide-in-from-top-2">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link href="/" className="text-lg font-medium p-2 hover:bg-muted/50 rounded-md" onClick={closeMenu}>Shop</Link>
              <Link href="/orders" className="text-lg font-medium p-2 hover:bg-muted/50 rounded-md" onClick={closeMenu}>Orders</Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>

      <footer className="border-t border-border/40 bg-card/50 py-8 mt-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity">
             <div className="h-8 w-8 overflow-hidden rounded-full border border-border">
                <img src={logoUrl} alt="DISJOINTED Logo" className="h-full w-full object-cover grayscale" />
              </div>
            <p className="text-xs text-muted-foreground font-mono">
              &copy; {new Date().getFullYear()} DISJOINTED LIFESTYLE. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
