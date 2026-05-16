import { useState } from "react";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORY_ICONS: Record<string, string> = {
  "Flower": "🌿",
  "Pre-Rolls": "🚬",
  "Edibles": "🍫",
  "Concentrates": "💎",
  "CBD": "💧",
};

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: products, isLoading: loadingProducts } = useListProducts({
    available: true,
    ...(selectedCategory ? { category: selectedCategory } : {}),
  });

  const { data: categories, isLoading: loadingCategories } = useListCategories();

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
          Browse the latest drops and collect when you're ready.
        </p>

        <div className="mt-10 flex justify-center gap-6 animate-in fade-in duration-700 delay-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{categories?.length ?? "—"}</div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/50 mt-0.5">Categories</div>
          </div>
          <div className="w-px bg-border/30" />
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{products?.length ?? "—"}</div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/50 mt-0.5">Products</div>
          </div>
          <div className="w-px bg-border/30" />
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">100%</div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/50 mt-0.5">Lab Tested</div>
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
          {selectedCategory && (
            <div className="mb-5 flex items-center gap-3">
              <span className="text-lg">{CATEGORY_ICONS[selectedCategory] ?? "🌿"}</span>
              <h2 className="text-lg font-bold tracking-tight">{selectedCategory}</h2>
              <button
                onClick={() => setSelectedCategory(null)}
                className="ml-auto text-xs font-mono text-muted-foreground/50 hover:text-primary transition-colors"
              >
                Clear ×
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
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((product, i) => (
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
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-primary mt-3 text-xs hover:underline font-mono"
                >
                  Clear filter
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
