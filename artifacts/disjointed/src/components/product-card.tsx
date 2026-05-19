import { Link } from "wouter";
import { ShoppingCart, Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@workspace/api-client-react";

interface ProductCardProps {
  product: Product;
}

const STRAIN_STYLES: Record<string, { badge: string; glow: string; accent: string }> = {
  indica:  { badge: "bg-purple-950/60 text-purple-300 border-purple-700/40", glow: "group-hover:shadow-[0_0_30px_-8px_rgba(147,51,234,0.25)]",  accent: "rgba(147,51,234,0.15)" },
  sativa:  { badge: "bg-orange-950/60 text-orange-300 border-orange-700/40", glow: "group-hover:shadow-[0_0_30px_-8px_rgba(234,88,12,0.25)]",    accent: "rgba(234,88,12,0.15)" },
  hybrid:  { badge: "bg-primary/20    text-primary    border-primary/30",    glow: "group-hover:shadow-[0_0_30px_-8px_rgba(74,140,63,0.3)]",    accent: "rgba(74,140,63,0.15)" },
  cbd:     { badge: "bg-sky-950/60    text-sky-300    border-sky-700/40",    glow: "group-hover:shadow-[0_0_30px_-8px_rgba(14,165,233,0.25)]",   accent: "rgba(14,165,233,0.15)" },
};

const DEFAULT_STYLE = { badge: "bg-muted text-muted-foreground border-border", glow: "group-hover:shadow-[0_0_30px_-8px_rgba(74,140,63,0.2)]", accent: "rgba(74,140,63,0.1)" };

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem);
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1);
    toast({
      title: "Added to cart",
      description: `${product.name} was added to your cart.`,
    });
  };

  const strainKey = product.strain?.toLowerCase() ?? "";
  const style = STRAIN_STYLES[strainKey] ?? DEFAULT_STYLE;
  const outOfStock = !product.available || (product.stock != null && product.stock <= 0);

  return (
    <Link href={`/product/${product.id}`} className="group block h-full">
      <div
        className={`relative h-full rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm overflow-hidden flex flex-col transition-all duration-300 hover:border-white/15 hover:bg-white/[0.055] ${style.glow}`}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-black/20">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Leaf className="w-14 h-14 text-primary/20" />
            </div>
          )}

          {/* Gradient overlay at bottom of image */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Strain badge */}
          {product.strain && (
            <div className="absolute top-3 left-3">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border backdrop-blur-md ${style.badge}`}>
                {product.strain}
              </span>
            </div>
          )}

          {/* THC quick-stat on image */}
          {product.thcLevel != null && Number(product.thcLevel) > 0 && (
            <div className="absolute bottom-3 right-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-md text-[11px] font-mono text-white/80 border border-white/10">
                <span className="text-primary/80 text-[9px] uppercase tracking-wider">THC</span>
                {Number(product.thcLevel).toFixed(1)}%
              </span>
            </div>
          )}

          {/* Out of stock overlay */}
          {outOfStock && (
            <div className="absolute inset-0 bg-background/75 backdrop-blur-sm flex items-center justify-center">
              <span className="px-4 py-1.5 rounded-full bg-destructive/20 border border-destructive/40 text-destructive text-xs font-mono uppercase tracking-widest">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4 gap-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors duration-200 line-clamp-2 flex-1">
              {product.name}
            </h3>
            <span className="font-mono font-bold text-base text-primary whitespace-nowrap mt-0.5">
              R{Number(product.price).toFixed(2)}
            </span>
          </div>

          {product.description && (
            <p className="text-xs text-muted-foreground/60 leading-relaxed line-clamp-2 font-mono">
              {product.description}
            </p>
          )}

          {/* Specs row */}
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-auto">
            {product.cbdLevel != null && Number(product.cbdLevel) > 0 && (
              <div className="flex items-center gap-1 text-[11px] font-mono">
                <span className="text-sky-400/60 text-[9px] uppercase tracking-wider">CBD</span>
                <span className="text-foreground/70">{Number(product.cbdLevel).toFixed(1)}%</span>
              </div>
            )}
            {product.weight && (
              <div className="flex items-center gap-1 text-[11px] font-mono">
                <span className="text-muted-foreground/40 text-[9px] uppercase tracking-wider">WT</span>
                <span className="text-foreground/70">{product.weight}</span>
              </div>
            )}
            {product.stock != null && product.stock > 0 && product.stock <= 10 && (
              <div className="ml-auto text-[10px] font-mono text-orange-400/70">
                {product.stock} left
              </div>
            )}
          </div>

          <Button
            className="w-full font-mono uppercase tracking-wider text-xs h-9 rounded-xl mt-1 bg-primary/15 text-primary border border-primary/20 hover:bg-primary/25 hover:border-primary/40 transition-all duration-200"
            variant="ghost"
            onClick={handleAddToCart}
            disabled={outOfStock}
          >
            <ShoppingCart className="w-3.5 h-3.5 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </Link>
  );
}
