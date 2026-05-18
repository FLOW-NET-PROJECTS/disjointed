import { useState } from "react";
import { Link } from "wouter";
import { Plus, Edit, Trash2, Leaf, AlertTriangle, Check, X } from "lucide-react";
import { useListProducts, useDeleteProduct, useUpdateProduct, getListProductsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin-layout";
import { AdminPinProtection } from "@/components/admin-pin-protection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import flowerIcon from "@assets/flower.png";
import prerollIcon from "@assets/preroll.png";
import ediblesIcon from "@assets/edibles.png";

const CATEGORY_ICONS: Record<string, string | React.ReactNode> = {
  "Flower": <img src={flowerIcon} className="w-4 h-4 object-contain" alt="Flower" />,
  "Pre-Rolls": <img src={prerollIcon} className="w-4 h-4 object-contain" alt="Pre-Rolls" />,
  "Edibles": <img src={ediblesIcon} className="w-4 h-4 object-contain" alt="Edibles" />,
  "Concentrates": "💎",
  "CBD": "💧",
};

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: products, isLoading } = useListProducts();
  const deleteProduct = useDeleteProduct();
  const updateProduct = useUpdateProduct();

  const [editingStock, setEditingStock] = useState<{ id: number; value: string } | null>(null);

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      toast({ title: "Product deleted" });
    } catch {
      toast({ title: "Failed to delete product", variant: "destructive" });
    }
  };

  const handleToggleAvailable = async (id: number, current: boolean) => {
    try {
      await updateProduct.mutateAsync({ id, data: { available: !current } });
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      toast({ title: `Product ${!current ? "activated" : "hidden"}` });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const handleStockSave = async (id: number) => {
    if (!editingStock || editingStock.id !== id) return;
    const newStock = parseInt(editingStock.value, 10);
    if (isNaN(newStock) || newStock < 0) {
      toast({ title: "Invalid stock value", variant: "destructive" });
      return;
    }
    try {
      await updateProduct.mutateAsync({ id, data: { stock: newStock, available: newStock > 0 ? undefined : false } });
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      toast({ title: "Stock updated" });
      setEditingStock(null);
    } catch {
      toast({ title: "Failed to update stock", variant: "destructive" });
    }
  };

  const handleStockQuick = async (id: number, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    try {
      await updateProduct.mutateAsync({ id, data: { stock: newStock, ...(newStock === 0 ? { available: false } : {}) } });
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
    } catch {
      toast({ title: "Failed to update stock", variant: "destructive" });
    }
  };

  return (
    <AdminPinProtection>
      <AdminLayout>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Products</h1>
            <p className="text-muted-foreground font-mono text-sm">Manage inventory, prices, and availability.</p>
          </div>
          <Link href="/admin/products/new">
            <Button className="font-mono uppercase tracking-widest text-xs">
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </Button>
          </Link>
        </div>

        <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-xl shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-mono uppercase tracking-widest text-muted-foreground bg-muted/20 border-b border-border/50">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">Category / Strain</th>
                  <th className="px-5 py-4 text-right">Price</th>
                  <th className="px-5 py-4 text-center">Stock</th>
                  <th className="px-5 py-4 text-center">Live</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  [1, 2, 3, 4, 5].map(i => (
                    <tr key={i}>
                      <td className="px-5 py-4"><Skeleton className="h-10 w-48" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-6 w-24" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-6 w-16 ml-auto" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-6 w-24 mx-auto" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-6 w-12 mx-auto" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-8 w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : products && products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-muted/30 border border-border/50 overflow-hidden shrink-0 flex items-center justify-center">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Leaf className="w-4 h-4 text-muted-foreground/50" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold truncate">{product.name}</span>
                            <span className="text-xs text-muted-foreground font-mono">{product.weight}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            {product.category && (
                              <span className="shrink-0">{CATEGORY_ICONS[product.category] ?? "🌿"}</span>
                            )}
                            <span className="font-medium text-xs">{product.category || "Uncategorized"}</span>
                          </div>
                          {product.strain && (
                            <span className="text-[10px] font-mono uppercase text-muted-foreground">{product.strain}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-mono font-bold">
                        R{product.price.toFixed(2)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-1">
                          {editingStock?.id === product.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                value={editingStock.value}
                                onChange={(e) => setEditingStock({ id: product.id, value: e.target.value })}
                                className="w-16 text-center text-sm font-mono bg-background border border-primary/50 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleStockSave(product.id);
                                  if (e.key === "Escape") setEditingStock(null);
                                }}
                              />
                              <button onClick={() => handleStockSave(product.id)} className="text-primary hover:text-primary/80">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => setEditingStock(null)} className="text-muted-foreground hover:text-foreground">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleStockQuick(product.id, product.stock ?? 0, -1)}
                                className="w-6 h-6 flex items-center justify-center rounded bg-muted/40 hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors font-mono text-sm"
                                disabled={(product.stock ?? 0) <= 0}
                              >−</button>
                              <button
                                onClick={() => setEditingStock({ id: product.id, value: String(product.stock ?? 0) })}
                                className="min-w-[2.5rem] text-center font-mono text-sm px-1 hover:bg-muted/40 rounded py-0.5 transition-colors"
                                title="Click to edit"
                              >
                                {product.stock ?? 0}
                              </button>
                              <button
                                onClick={() => handleStockQuick(product.id, product.stock ?? 0, 1)}
                                className="w-6 h-6 flex items-center justify-center rounded bg-muted/40 hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors font-mono text-sm"
                              >+</button>
                              {(product.stock ?? 0) <= 5 && (product.stock ?? 0) > 0 && (
                                <AlertTriangle className="w-3 h-3 text-yellow-500 ml-1" />
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center">
                          <Switch
                            checked={product.available}
                            onCheckedChange={() => handleToggleAvailable(product.id, product.available)}
                            className="data-[state=checked]:bg-primary"
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-card border-border">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "{product.name}". This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="font-mono uppercase tracking-widest text-xs">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(product.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-mono uppercase tracking-widest text-xs"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-mono text-sm">
                      No products found. Click "Add Product" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
    </AdminPinProtection>
  );
}
