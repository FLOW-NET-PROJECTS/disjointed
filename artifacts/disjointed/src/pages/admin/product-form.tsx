import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { ChevronLeft, Upload, Image as ImageIcon } from "lucide-react";
import { 
  useCreateProduct, 
  useUpdateProduct, 
  useGetProduct,
  useListCategories,
  useUploadImage,
  getListProductsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin-layout";
import { AdminPinProtection } from "@/components/admin-pin-protection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

export default function AdminProductForm() {
  const params = useParams();
  const isEditing = !!params.id && params.id !== "new";
  const productId = isEditing ? parseInt(params.id!, 10) : 0;
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    thcLevel: "",
    cbdLevel: "",
    strain: "",
    weight: "",
    categoryId: "none",
    stock: "",
    available: true,
    imageUrl: ""
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const { data: categories } = useListCategories();
  const { data: product, isLoading: loadingProduct } = useGetProduct(productId, {
    query: { enabled: isEditing }
  });

  // Mutations
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const uploadImage = useUploadImage();

  useEffect(() => {
    if (isEditing && product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        thcLevel: product.thcLevel !== null ? product.thcLevel.toString() : "",
        cbdLevel: product.cbdLevel !== null ? product.cbdLevel.toString() : "",
        strain: product.strain || "",
        weight: product.weight || "",
        categoryId: product.categoryId ? product.categoryId.toString() : "none",
        stock: product.stock !== null ? product.stock.toString() : "",
        available: product.available,
        imageUrl: product.imageUrl || ""
      });
    }
  }, [isEditing, product]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const res = await uploadImage.mutateAsync({
          data: { imageData: base64Data }
        });
        setFormData(prev => ({ ...prev, imageUrl: res.url }));
        toast({ title: "Image uploaded successfully" });
      };
    } catch (error) {
      toast({ title: "Failed to upload image", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast({ title: "Missing fields", description: "Name and price are required.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        thcLevel: formData.thcLevel ? parseFloat(formData.thcLevel) : undefined,
        cbdLevel: formData.cbdLevel ? parseFloat(formData.cbdLevel) : undefined,
        strain: formData.strain || undefined,
        weight: formData.weight || undefined,
        categoryId: formData.categoryId !== "none" ? parseInt(formData.categoryId, 10) : undefined,
        stock: formData.stock ? parseInt(formData.stock, 10) : undefined,
        available: formData.available,
        imageUrl: formData.imageUrl || undefined
      };

      if (isEditing) {
        await updateProduct.mutateAsync({ id: productId, data: payload });
        toast({ title: "Product updated successfully" });
      } else {
        await createProduct.mutateAsync({ data: payload });
        toast({ title: "Product created successfully" });
      }

      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      setLocation("/admin/products");
    } catch (error) {
      toast({ title: "Error saving product", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditing && loadingProduct) {
    return <AdminLayout><div className="p-8">Loading...</div></AdminLayout>;
  }

  return (
    <AdminPinProtection>
      <AdminLayout>
        <div className="mb-6">
          <Button variant="link" onClick={() => setLocation("/admin/products")} className="p-0 text-muted-foreground font-mono text-xs uppercase tracking-widest hover:text-foreground">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Products
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{isEditing ? "Edit Product" : "New Product"}</h1>
          <p className="text-muted-foreground font-mono text-sm">Fill in the details for this item.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl pb-16">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Details */}
            <div className="md:col-span-2 space-y-6 bg-card/30 p-6 rounded-xl border border-border/50">
              <h3 className="font-bold border-b border-border/50 pb-2 mb-4 font-mono uppercase tracking-widest text-sm">Basic Info</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs uppercase font-mono tracking-widest text-muted-foreground">Product Name *</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required className="bg-background/50" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs uppercase font-mono tracking-widest text-muted-foreground">Description</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} className="h-32 bg-background/50 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-xs uppercase font-mono tracking-widest text-muted-foreground">Price ($) *</Label>
                  <Input id="price" name="price" type="number" step="0.01" min="0" value={formData.price} onChange={handleInputChange} required className="font-mono bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-xs uppercase font-mono tracking-widest text-muted-foreground">Stock Qty (Leave empty for ∞)</Label>
                  <Input id="stock" name="stock" type="number" min="0" value={formData.stock} onChange={handleInputChange} className="font-mono bg-background/50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryId" className="text-xs uppercase font-mono tracking-widest text-muted-foreground">Category</Label>
                  <Select value={formData.categoryId} onValueChange={(val) => handleSelectChange("categoryId", val)}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Category</SelectItem>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          <div className="flex items-center gap-2">
                            <span>{CATEGORY_ICONS[cat.name] ?? "🌿"}</span>
                            <span>{cat.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-xs uppercase font-mono tracking-widest text-muted-foreground">Weight / Volume (e.g. 3.5g)</Label>
                  <Input id="weight" name="weight" value={formData.weight} onChange={handleInputChange} className="bg-background/50" />
                </div>
              </div>

              <h3 className="font-bold border-b border-border/50 pb-2 mt-8 mb-4 font-mono uppercase tracking-widest text-sm">Cannabinoid Profile</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="strain" className="text-xs uppercase font-mono tracking-widest text-muted-foreground">Strain Type</Label>
                  <Select value={formData.strain || "none"} onValueChange={(val) => handleSelectChange("strain", val === "none" ? "" : val)}>
                    <SelectTrigger className="bg-background/50 font-mono text-sm">
                      <SelectValue placeholder="Select strain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">N/A</SelectItem>
                      <SelectItem value="Indica">Indica</SelectItem>
                      <SelectItem value="Sativa">Sativa</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                      <SelectItem value="CBD">CBD Focus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thcLevel" className="text-xs uppercase font-mono tracking-widest text-muted-foreground">THC %</Label>
                  <Input id="thcLevel" name="thcLevel" type="number" step="0.1" min="0" max="100" value={formData.thcLevel} onChange={handleInputChange} className="font-mono bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cbdLevel" className="text-xs uppercase font-mono tracking-widest text-muted-foreground">CBD %</Label>
                  <Input id="cbdLevel" name="cbdLevel" type="number" step="0.1" min="0" max="100" value={formData.cbdLevel} onChange={handleInputChange} className="font-mono bg-background/50" />
                </div>
              </div>
            </div>

            {/* Sidebar Details */}
            <div className="space-y-6">
              <div className="bg-card/30 p-6 rounded-xl border border-border/50 space-y-4">
                <h3 className="font-bold border-b border-border/50 pb-2 mb-4 font-mono uppercase tracking-widest text-sm">Visibility</h3>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="available" className="cursor-pointer">Active on Store</Label>
                  <Switch 
                    id="available" 
                    checked={formData.available} 
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, available: checked }))} 
                  />
                </div>
                <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                  If disabled, the product will not appear in the shop catalog.
                </p>
              </div>

              <div className="bg-card/30 p-6 rounded-xl border border-border/50 space-y-4">
                <h3 className="font-bold border-b border-border/50 pb-2 mb-4 font-mono uppercase tracking-widest text-sm">Product Image</h3>
                
                <div className="aspect-square w-full rounded-lg border-2 border-dashed border-border/50 overflow-hidden flex flex-col items-center justify-center relative bg-background/50">
                  {formData.imageUrl ? (
                    <>
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Label htmlFor="imageUpload" className="cursor-pointer bg-background/80 px-4 py-2 rounded-md hover:bg-background transition-colors font-mono text-xs uppercase">
                          Change Image
                        </Label>
                      </div>
                    </>
                  ) : (
                    <Label htmlFor="imageUpload" className="cursor-pointer flex flex-col items-center justify-center w-full h-full hover:bg-muted/10 transition-colors">
                      {isUploading ? (
                        <div className="animate-pulse flex flex-col items-center">
                          <Upload className="w-8 h-8 text-primary mb-2" />
                          <span className="font-mono text-xs text-primary uppercase">Uploading...</span>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="w-8 h-8 text-muted-foreground/50 mb-2" />
                          <span className="font-mono text-xs text-muted-foreground uppercase text-center px-4">Click to upload<br/>image</span>
                        </>
                      )}
                    </Label>
                  )}
                  <input 
                    id="imageUpload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 border-t border-border/50 pt-8 mt-8">
            <Button type="button" variant="outline" onClick={() => setLocation("/admin/products")} className="font-mono uppercase tracking-widest text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading} className="font-mono uppercase tracking-widest text-xs bg-primary text-primary-foreground">
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </form>
      </AdminLayout>
    </AdminPinProtection>
  );
}