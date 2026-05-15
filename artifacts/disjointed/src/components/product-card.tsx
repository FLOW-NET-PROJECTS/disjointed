import { Link } from "wouter";
import { ShoppingCart, Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@workspace/api-client-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem);
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product detail
    addItem(product, 1);
    toast({
      title: "Added to cart",
      description: `${product.name} was added to your cart.`,
    });
  };

  const strainColor = () => {
    switch (product.strain?.toLowerCase()) {
      case "indica": return "bg-purple-900/50 text-purple-300 border-purple-800";
      case "sativa": return "bg-orange-900/50 text-orange-300 border-orange-800";
      case "hybrid": return "bg-primary/20 text-primary border-primary/30";
      case "cbd": return "bg-blue-900/50 text-blue-300 border-blue-800";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <Link href={`/product/${product.id}`} className="group block h-full">
      <Card className="h-full bg-card/50 border-border/50 hover:border-primary/50 hover:bg-card/80 transition-all duration-300 overflow-hidden flex flex-col group-hover:shadow-[0_0_30px_-10px_rgba(74,140,63,0.2)]">
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Leaf className="w-12 h-12 opacity-20" />
            </div>
          )}
          
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.strain && (
              <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-wider backdrop-blur-md ${strainColor()}`}>
                {product.strain}
              </Badge>
            )}
          </div>
          
          {(!product.available || (product.stock !== null && product.stock <= 0)) && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <Badge variant="destructive" className="font-mono text-xs uppercase tracking-widest px-3 py-1">Out of Stock</Badge>
            </div>
          )}
        </div>
        
        <CardContent className="p-4 flex-grow flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-sans font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">{product.name}</h3>
              <span className="font-mono font-bold text-lg ml-2 whitespace-nowrap">R{product.price.toFixed(2)}</span>
            </div>
            
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-xs text-muted-foreground font-mono">
              {product.thcLevel != null && (
                <div className="flex items-center gap-1">
                  <span className="text-primary/70">THC</span>
                  <span className="text-foreground">{product.thcLevel}%</span>
                </div>
              )}
              {product.cbdLevel != null && product.cbdLevel > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-blue-400/70">CBD</span>
                  <span className="text-foreground">{product.cbdLevel}%</span>
                </div>
              )}
              {product.weight && (
                <div className="flex items-center gap-1">
                  <span className="text-foreground/50">WT</span>
                  <span className="text-foreground">{product.weight}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0">
          <Button 
            className="w-full font-mono uppercase tracking-wider text-xs" 
            variant="secondary"
            onClick={handleAddToCart}
            disabled={!product.available || (product.stock !== null && product.stock <= 0)}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}