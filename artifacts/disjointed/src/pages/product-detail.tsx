import { useState } from "react";
import { useParams, Link } from "wouter";
import { ChevronLeft, ShoppingCart, Leaf, Info, ShieldAlert } from "lucide-react";
import { useGetProduct } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCart((state) => state.addItem);
  const { toast } = useToast();

  const { data: product, isLoading, isError } = useGetProduct(id, {
    query: { enabled: !!id, queryKey: ["getProduct", id] }
  });

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      toast({
        title: "Added to cart",
        description: `${quantity}x ${product.name} added to your cart.`,
      });
    }
  };

  const strainColor = () => {
    if (!product) return "";
    switch (product.strain?.toLowerCase()) {
      case "indica": return "bg-purple-900/50 text-purple-300 border-purple-800";
      case "sativa": return "bg-orange-900/50 text-orange-300 border-orange-800";
      case "hybrid": return "bg-primary/20 text-primary border-primary/30";
      case "cbd": return "bg-blue-900/50 text-blue-300 border-blue-800";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  if (isError) {
    return (
      <Layout>
        <div className="h-[60vh] flex flex-col items-center justify-center">
          <ShieldAlert className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">The item you're looking for doesn't exist or was removed.</p>
          <Link href="/">
            <Button variant="outline"><ChevronLeft className="w-4 h-4 mr-2" /> Back to Shop</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-sm font-mono text-muted-foreground hover:text-foreground transition-colors group">
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Collection
        </Link>
      </div>

      {isLoading || !product ? (
        <div className="grid md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square w-full rounded-xl bg-muted/30" />
          <div className="space-y-6 pt-4">
            <Skeleton className="h-10 w-3/4 bg-muted/30" />
            <Skeleton className="h-8 w-1/4 bg-muted/30" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-muted/30" />
              <Skeleton className="h-4 w-full bg-muted/30" />
              <Skeleton className="h-4 w-5/6 bg-muted/30" />
            </div>
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-12 w-32 bg-muted/30" />
              <Skeleton className="h-12 flex-1 bg-muted/30" />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-muted/20 border border-border/50 rounded-xl flex items-center justify-center shadow-lg">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="object-cover w-full h-full"
              />
            ) : (
              <Leaf className="w-24 h-24 text-muted-foreground/30" />
            )}
            
            {(!product.available || (product.stock != null && product.stock <= 0)) && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <Badge variant="destructive" className="font-mono text-lg uppercase tracking-widest px-6 py-2 border-2">Out of Stock</Badge>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col pt-2 lg:pt-8 animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="mb-2 flex items-center gap-3">
              {product.category && (
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{product.category}</span>
              )}
              {product.strain && (
                <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-wider ${strainColor()}`}>
                  {product.strain}
                </Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-none">{product.name}</h1>
            
            <div className="text-3xl font-mono mb-8 text-primary/90 flex items-center gap-4">
              R{product.price.toFixed(2)}
              {product.weight && <span className="text-lg text-muted-foreground">/ {product.weight}</span>}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8 bg-card/30 p-4 border border-border/50 rounded-lg font-mono text-sm">
              <div className="flex flex-col">
                <span className="text-muted-foreground uppercase text-[10px] tracking-widest mb-1">THC Level</span>
                <span className="font-bold text-lg">{product.thcLevel != null ? `${product.thcLevel}%` : 'N/A'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground uppercase text-[10px] tracking-widest mb-1">CBD Level</span>
                <span className="font-bold text-lg">{product.cbdLevel != null ? `${product.cbdLevel}%` : '0%'}</span>
              </div>
              {product.stock != null && (
                <div className="flex flex-col col-span-2 pt-2 border-t border-border/50 mt-2">
                  <span className="text-muted-foreground uppercase text-[10px] tracking-widest mb-1">Availability</span>
                  <span className={`${(product.stock ?? 0) > 0 ? "text-primary" : "text-destructive"}`}>
                    {(product.stock ?? 0) > 0 ? `${product.stock} units in stock` : 'Out of stock'}
                  </span>
                </div>
              )}
            </div>

            <div className="mb-10 text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {product.description || "No description available for this product."}
            </div>

            <div className="mt-auto flex gap-4">
              <div className="flex items-center border border-border rounded-md bg-background h-12">
                <button 
                  className="px-4 text-muted-foreground hover:text-foreground h-full transition-colors"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!product.available || (product.stock != null && product.stock <= 0)}
                >
                  -
                </button>
                <span className="font-mono w-8 text-center">{quantity}</span>
                <button 
                  className="px-4 text-muted-foreground hover:text-foreground h-full transition-colors"
                  onClick={() => setQuantity(product.stock ? Math.min(product.stock, quantity + 1) : quantity + 1)}
                  disabled={!product.available || (product.stock != null && product.stock <= 0) || (product.stock != null && quantity >= product.stock)}
                >
                  +
                </button>
              </div>
              
              <Button 
                className="flex-1 h-12 font-mono uppercase tracking-widest text-sm" 
                size="lg"
                onClick={handleAddToCart}
                disabled={!product.available || (product.stock != null && product.stock <= 0)}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </div>
            
            <div className="mt-6 flex items-start gap-2 text-xs text-muted-foreground bg-muted/20 p-3 rounded border border-border/30">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-primary/70" />
              <p>For adult use only. Must be 21+ to purchase. Store in a cool, dry place away from children and pets.</p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}