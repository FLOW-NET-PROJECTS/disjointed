import { useState } from "react";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: products, isLoading: loadingProducts } = useListProducts({
    available: true,
    ...(selectedCategory ? { category: selectedCategory } : {})
  });

  const { data: categories, isLoading: loadingCategories } = useListCategories();

  return (
    <Layout>
      {/* Hero */}
      <div className="relative mb-14 pt-10 pb-16 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-primary/8 via-transparent to-transparent pointer-events-none" />
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-primary/60 mb-4">— Premium Selection —</p>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-5 leading-none">
          Kick Back.<br />
          <span className="text-primary/80">Light Up.</span>
        </h1>
        <p className="text-muted-foreground font-mono max-w-lg mx-auto text-sm leading-relaxed">
          Handpicked flower, extracts & edibles for the discerning. Browse the latest drops, order ahead, and collect when you're ready.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Category Filter */}
        <div className="w-full md:w-44 shrink-0">
          <div className="sticky top-24">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 mb-3">Browse</p>
            {loadingCategories ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-9 w-full rounded-lg bg-muted/40" />)}
              </div>
            ) : (
              <div className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 hide-scrollbar">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                    selectedCategory === null
                      ? "bg-primary/15 text-primary border border-primary/25 shadow-[0_0_12px_-4px_rgba(74,140,63,0.4)]"
                      : "text-muted-foreground hover:bg-muted/40 border border-transparent hover:text-foreground"
                  }`}
                >
                  All Drops
                </button>
                {categories?.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                      selectedCategory === category.name
                        ? "bg-primary/15 text-primary border border-primary/25 shadow-[0_0_12px_-4px_rgba(74,140,63,0.4)]"
                        : "text-muted-foreground hover:bg-muted/40 border border-transparent hover:text-foreground"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="space-y-4 h-full">
                  <Skeleton className="aspect-square w-full rounded-2xl bg-muted/30" />
                  <Skeleton className="h-6 w-3/4 bg-muted/30" />
                  <Skeleton className="h-4 w-1/2 bg-muted/30" />
                  <Skeleton className="h-10 w-full bg-muted/30 mt-4" />
                </div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, i) => (
                <div
                  key={product.id}
                  className="animate-in fade-in slide-in-from-bottom-6 duration-500 fill-mode-both"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-border/40 rounded-2xl bg-card/10">
              <p className="text-muted-foreground font-mono text-sm">Nothing here yet.</p>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-primary mt-3 text-sm hover:underline font-mono"
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
