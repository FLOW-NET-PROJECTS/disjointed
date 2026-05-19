import { useState, useMemo } from "react";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

import flowerIcon from "@assets/flower.png";
import prerollIcon from "@assets/preroll.png";
import ediblesIcon from "@assets/edibles.png";

const CATEGORY_ICONS: Record<string, string | React.ReactNode> = {
  "Flower": <img src={flowerIcon} className="w-5 h-5 object-contain" alt="Flower" />,
  "Pre-Rolls": <img src={prerollIcon} className="w-5 h-5 object-contain" alt="Pre-Rolls" />,
  "Edibles": <img src={ediblesIcon} className="w-5 h-5 object-contain" alt="Edibles" />,
  "Concentrates": "💎",
  "CBD": "💧",
};

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products, isLoading: loadingProducts } = useListProducts({
    available: true,
    ...(selectedCategory ? { category: selectedCategory } : {}),
  });

  const { data: categories, isLoading: loadingCategories } = useListCategories();

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchQuery.trim()) return products;
    
    const query = searchQuery.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      (p.description && p.description.toLowerCase().includes(query)) ||
      (p.strain && p.strain.toLowerCase().includes(query))
    );
  }, [products, searchQuery]);

  return (
    <Layout>
      {/* Hero */}
      <div className="relative mb-16 pt-12 pb-20 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(74,140,63,0.07)_0%,transparent_70%)]" />
        </div>

        <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-primary/50 mb-5 animate-in fade-in duration-700">
          ✦ &nbsp; Premium Selection &nbsp; ✦
        </p>
        <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-6 leading-[0.9] animate-in fade-in slide-in-from-bottom-4 duration-700">
          Kick&nbsp;Back.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary/80 to-primary/50">
            Light&nbsp;Up.
          </span>
        </h1>
        <p className="text-muted-foreground/70 font-mono max-w-md mx-auto text-xs leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          Handpicked flower, extracts & edibles for the discerning.<br />
          Browse the latest drops, then register or log in to unlock products and checkout.
        </p>

        <div className="mt-10 flex justify-center gap-6 animate-in fade-in duration-700 delay-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{categories?.length ?? "—"}</div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/50 mt-0.5">Categories</div>
          </div>
          <div className="w-px bg-border/30" />
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{filteredProducts.length ?? "—"}</div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/50 mt-0.5">Products</div>
          </div>
        </div>

        <div className="mt-12 max-w-md mx-auto relative group animate-in fade-in duration-700 delay-300">
          <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl group-hover:bg-primary/10 transition-all duration-500" />
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Search flower, edibles, strains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 pl-11 pr-4 bg-background/50 border-white/10 rounded-2xl focus:border-primary/50 focus:ring-primary/20 font-mono text-sm transition-all shadow-lg"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Category Sidebar */}
        <aside className="w-full md:w-48 shrink-0">
          <div className="md:sticky md:top-24">
            <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-muted-foreground/40 mb-3 px-1">
              Browse
            </p>
            {loadingCategories ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-xl bg-white/5" />
                ))}
              </div>
            ) : (
              <div className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`flex items-center gap-2.5 text-left px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap border ${
                    selectedCategory === null
                      ? "bg-primary/15 text-primary border-primary/25 shadow-[0_0_16px_-4px_rgba(74,140,63,0.35)] font-semibold"
                      : "text-muted-foreground/70 border-transparent hover:bg-white/5 hover:text-foreground hover:border-white/8"
                  }`}
                >
                  <span className="text-base leading-none">🏠</span>
                  <span>All Drops</span>
                </button>
                {categories?.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`flex items-center gap-2.5 text-left px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap border ${
                      selectedCategory === category.name
                        ? "bg-primary/15 text-primary border-primary/25 shadow-[0_0_16px_-4px_rgba(74,140,63,0.35)] font-semibold"
                        : "text-muted-foreground/70 border-transparent hover:bg-white/5 hover:text-foreground hover:border-white/8"
                    }`}
                  >
                    <span className="text-base leading-none">
                      {CATEGORY_ICONS[category.name] ?? "🌿"}
                    </span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          {(selectedCategory || searchQuery) && (
            <div className="mb-5 flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-300">
              {selectedCategory && (
                <>
                  <span className="text-lg">{CATEGORY_ICONS[selectedCategory] ?? "🌿"}</span>
                  <h2 className="text-lg font-bold tracking-tight">{selectedCategory}</h2>
                </>
              )}
              {selectedCategory && searchQuery && <span className="text-muted-foreground/30">•</span>}
              {searchQuery && (
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
                  <Search className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm font-mono text-muted-foreground">"{searchQuery}"</span>
                </div>
              )}
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchQuery("");
                }}
                className="ml-auto text-xs font-mono text-muted-foreground/50 hover:text-primary transition-colors"
              >
                Clear all ×
              </button>
            </div>
          )}

          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-2xl bg-white/5" />
                  <Skeleton className="h-5 w-3/4 bg-white/5" />
                  <Skeleton className="h-4 w-1/2 bg-white/5" />
                  <Skeleton className="h-10 w-full bg-white/5 rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((product, i) => (
                <div
                  key={product.id}
                  className="animate-in fade-in slide-in-from-bottom-5 duration-500 fill-mode-both"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
              <span className="text-3xl mb-3">🌿</span>
              <p className="text-muted-foreground/50 font-mono text-sm">Nothing here yet.</p>
              {(selectedCategory || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchQuery("");
                  }}
                  className="text-primary mt-3 text-xs hover:underline font-mono"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
