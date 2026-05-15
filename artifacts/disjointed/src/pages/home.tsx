import { useState } from "react";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { data: products, isLoading: loadingProducts } = useListProducts({ 
    available: true,
    ...(selectedCategory ? { category: selectedCategory } : {})
  });
  
  const { data: categories, isLoading: loadingCategories } = useListCategories();

  return (
    <Layout>
      <div className="mb-12 flex flex-col items-center text-center space-y-4 pt-8 pb-12 border-b border-border/40">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase">Curated. Elevated.</h1>
        <p className="text-muted-foreground font-mono max-w-2xl mx-auto">
          Premium cannabis lifestyle products selected for the discerning connoisseur.
          Shop our latest drops below.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Categories Sidebar */}
        <div className="w-full md:w-48 shrink-0">
          <div className="sticky top-24">
            <h3 className="font-mono text-sm uppercase tracking-widest text-muted-foreground mb-4 pb-2 border-b border-border/50">Filter</h3>
            
            {loadingCategories ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-8 w-full bg-muted/50" />)}
              </div>
            ) : (
              <div className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 hide-scrollbar">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`text-left px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    selectedCategory === null 
                      ? "bg-primary/20 text-primary border border-primary/30" 
                      : "text-muted-foreground hover:bg-muted/50 border border-transparent"
                  }`}
                >
                  All Products
                </button>
                {categories?.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`text-left px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                      selectedCategory === category.name
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "text-muted-foreground hover:bg-muted/50 border border-transparent"
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
                  <Skeleton className="aspect-square w-full rounded-xl bg-muted/30" />
                  <Skeleton className="h-6 w-3/4 bg-muted/30" />
                  <Skeleton className="h-4 w-1/2 bg-muted/30" />
                  <Skeleton className="h-10 w-full bg-muted/30 mt-4" />
                </div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, i) => (
                <div key={product.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both" style={{ animationDelay: `${i * 100}ms` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-border/50 rounded-xl bg-card/20">
              <p className="text-muted-foreground font-mono">No products found in this category.</p>
              {selectedCategory && (
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="text-primary mt-2 text-sm hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}