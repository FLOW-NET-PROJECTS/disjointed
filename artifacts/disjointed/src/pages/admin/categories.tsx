import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useListCategories, useCreateCategory, useDeleteCategory, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin-layout";
import { AdminPinProtection } from "@/components/admin-pin-protection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function AdminCategories() {
  const [newCategoryName, setNewCategoryName] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: categories, isLoading } = useListCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      await createCategory.mutateAsync({ data: { name: newCategoryName } });
      setNewCategoryName("");
      queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      toast({ title: "Category created successfully" });
    } catch (error) {
      toast({ title: "Failed to create category", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure? This won't delete products, but will unassign them from this category.")) return;
    
    try {
      await deleteCategory.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      toast({ title: "Category deleted" });
    } catch (error) {
      toast({ title: "Failed to delete category", variant: "destructive" });
    }
  };

  return (
    <AdminPinProtection>
      <AdminLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Categories</h1>
          <p className="text-muted-foreground font-mono text-sm">Organize products into sections for the shop.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-card/50 border border-border/50 rounded-xl p-6 sticky top-8">
              <h3 className="font-bold mb-4 font-mono uppercase tracking-widest text-sm">Add Category</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <Input 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Concentrates" 
                  className="bg-background/50 font-mono"
                  required
                />
                <Button 
                  type="submit" 
                  className="w-full font-mono uppercase tracking-widest text-xs"
                  disabled={!newCategoryName.trim() || createCategory.isPending}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add
                </Button>
              </form>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="text-xs font-mono uppercase tracking-widest text-muted-foreground bg-muted/20 border-b border-border/50">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4 text-right">Created</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {isLoading ? (
                    [1, 2, 3].map(i => (
                      <tr key={i}>
                        <td className="px-6 py-4"><Skeleton className="h-6 w-32" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-6 w-24 ml-auto" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-8 w-8 ml-auto" /></td>
                      </tr>
                    ))
                  ) : categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <tr key={category.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4 font-bold">{category.name}</td>
                        <td className="px-6 py-4 text-right font-mono text-xs text-muted-foreground">
                          {category.createdAt ? format(new Date(category.createdAt), "MMM d, yyyy") : "-"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(category.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground font-mono text-sm">
                        No categories found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminPinProtection>
  );
}