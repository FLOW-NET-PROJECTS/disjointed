import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Tags, 
  LogOut,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InstallWrapperButton } from "@/components/install-wrapper-button";
import { useManifest } from "@/hooks/use-manifest";
import { setAdminUnlocked } from "@/lib/admin-access";
import logoUrl from "@assets/logo.jpg";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  useManifest("admin");
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    setAdminUnlocked(false);
    setLocation("/admin");
  };

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/categories", label: "Categories", icon: Tags },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-border/40 bg-card/20 backdrop-blur-sm flex flex-col">
        <div className="h-16 flex items-center px-5 border-b border-border/40 gap-3">
          <div className="h-8 w-8 overflow-hidden rounded-full border border-primary/40 shadow-[0_0_10px_-2px_rgba(74,140,63,0.4)] shrink-0">
            <img src={logoUrl} alt="DISJOINTED Logo" className="h-full w-full object-cover" />
          </div>
          <Link href="/admin/dashboard" className="font-bold text-primary tracking-widest text-sm">
            DISJOINTED<span className="text-muted-foreground font-normal"> / ADMIN</span>
          </Link>
        </div>
        
        <div className="p-4 flex-grow flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/admin/dashboard" && location.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-sm font-medium ${
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-border mt-auto flex flex-col gap-2">
          <InstallWrapperButton
            variant="admin"
            className="w-full justify-start font-mono uppercase tracking-widest text-xs"
          />
          <Link href="/" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back to Shop
          </Link>
          <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-3" />
            Lock Portal
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
