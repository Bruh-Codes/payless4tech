"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { db as supabase } from "@/lib/database";
import { getProduct } from "@/lib/bizhub-api";
import { 
  Search, 
  Edit3, 
  Eye, 
  EyeOff, 
  Archive, 
  RefreshCw as Sync, 
  Upload,
  Save,
  X
} from "lucide-react";
import Image from "next/image";

interface WebsiteProduct {
  id: string;
  bizhub_id: number | null;
  name: string;
  description: string | null;
  detailed_specs: string | null;
  price: number;
  original_price: number | null;
  condition: string;
  category: string;
  image_url: string | null;
  status: 'draft' | 'active' | 'inactive' | 'archived';
  make: string | null;
  model: string | null;
  asset_tag: string | null;
  currency: string;
  bizhub_quantity: number;
  created_at: string;
  updated_at: string;
}

const ProductManagePage = () => {
  const [products, setProducts] = useState<WebsiteProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<WebsiteProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  // Edit modal state
  const [editingProduct, setEditingProduct] = useState<WebsiteProduct | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    detailed_specs: "",
    price: 0,
    category: "",
    condition: ""
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, statusFilter]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.make && product.make.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.model && product.model.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(product => product.status === statusFilter);
    }

    setFilteredProducts(filtered);
  };

  const updateProductStatus = async (productId: string, newStatus: 'active' | 'inactive' | 'archived') => {
    setUpdatingIds(prev => new Set([...prev, productId]));

    try {
      const { error } = await supabase
        .from("products")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", productId);

      if (error) throw error;

      setProducts(prev => 
        prev.map(p => 
          p.id === productId 
            ? { ...p, status: newStatus, updated_at: new Date().toISOString() }
            : p
        )
      );

      const statusMessages = {
        active: "Product published to website",
        inactive: "Product hidden from website", 
        archived: "Product archived"
      };

      toast.success(statusMessages[newStatus]);

    } catch (error: any) {
      console.error("Error updating product status:", error);
      toast.error("Failed to update product status", {
        description: error.message
      });
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const syncWithBizhub = async (product: WebsiteProduct) => {
    if (!product.bizhub_id) {
      toast.error("Cannot sync - no Bizhub ID");
      return;
    }

    setUpdatingIds(prev => new Set([...prev, product.id]));

    try {
      const response = await getProduct(product.bizhub_id);
      
      if (!response.success) {
        throw new Error(response.error?.message || "Failed to fetch from Bizhub");
      }

      const bizhubProduct = response.data;
      
      // Update quantity and original price from Bizhub
      const { error } = await supabase
        .from("products")
        .update({
          bizhub_quantity: bizhubProduct.quantity,
          original_price: bizhubProduct.price,
          updated_at: new Date().toISOString()
        })
        .eq("id", product.id);

      if (error) throw error;

      setProducts(prev =>
        prev.map(p =>
          p.id === product.id
            ? {
                ...p,
                bizhub_quantity: bizhubProduct.quantity,
                original_price: bizhubProduct.price,
                updated_at: new Date().toISOString()
              }
            : p
        )
      );

      toast.success("Synced with Bizhub", {
        description: `Updated quantity: ${bizhubProduct.quantity}, price: ₵${bizhubProduct.price}`
      });

    } catch (error: any) {
      console.error("Error syncing with Bizhub:", error);
      toast.error("Failed to sync with Bizhub", {
        description: error.message
      });
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }
  };

  const openEditModal = (product: WebsiteProduct) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      description: product.description || "",
      detailed_specs: product.detailed_specs || "",
      price: product.price,
      category: product.category,
      condition: product.condition
    });
  };

  const saveProductChanges = async () => {
    if (!editingProduct) return;

    setUpdatingIds(prev => new Set([...prev, editingProduct.id]));

    try {
      const { error } = await supabase
        .from("products")
        .update({
          ...editForm,
          updated_at: new Date().toISOString()
        })
        .eq("id", editingProduct.id);

      if (error) throw error;

      setProducts(prev =>
        prev.map(p =>
          p.id === editingProduct.id
            ? { ...p, ...editForm, updated_at: new Date().toISOString() }
            : p
        )
      );

      toast.success("Product updated successfully");
      setEditingProduct(null);

    } catch (error: any) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product", {
        description: error.message
      });
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(editingProduct.id);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: "secondary" as const, label: "Draft" },
      active: { variant: "default" as const, label: "Published" },
      inactive: { variant: "outline" as const, label: "Hidden" },
      archived: { variant: "destructive" as const, label: "Archived" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manage Website Products</h1>
        <p className="text-muted-foreground">
          Enhance imported products and control what appears on your website.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select 
          className="px-3 py-2 border rounded-md"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Published</option>
          <option value="inactive">Hidden</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-sm text-muted-foreground">Total Products</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {products.filter(p => p.status === 'draft').length}
            </div>
            <p className="text-sm text-muted-foreground">Drafts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {products.filter(p => p.status === 'active').length}
            </div>
            <p className="text-sm text-muted-foreground">Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {products.filter(p => p.status === 'inactive').length}
            </div>
            <p className="text-sm text-muted-foreground">Hidden</p>
          </CardContent>
        </Card>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <Card key={product.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold truncate">
                    {product.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {product.make} {product.model} • {product.condition}
                  </p>
                </div>
                <div className="ml-2">
                  {getStatusBadge(product.status)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {product.image_url && (
                <div className="mb-4 relative h-32 bg-gray-100 rounded-md overflow-hidden">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Price:</span>
                  <span className="font-semibold">₵{product.price.toLocaleString()}</span>
                </div>
                {product.original_price && product.original_price !== product.price && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Original:</span>
                    <span>₵{product.original_price.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Stock:</span>
                  <span className={product.bizhub_quantity > 0 ? "text-green-600" : "text-red-600"}>
                    {product.bizhub_quantity} units
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Category:</span>
                  <span>{product.category}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditModal(product)}
                    disabled={updatingIds.has(product.id)}
                    className="flex-1"
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  {product.bizhub_id && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => syncWithBizhub(product)}
                      disabled={updatingIds.has(product.id)}
                    >
                      <Sync className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="flex gap-2">
                  {product.status === 'draft' && (
                    <Button
                      size="sm"
                      onClick={() => updateProductStatus(product.id, 'active')}
                      disabled={updatingIds.has(product.id)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Publish
                    </Button>
                  )}
                  {product.status === 'active' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => updateProductStatus(product.id, 'inactive')}
                      disabled={updatingIds.has(product.id)}
                      className="flex-1"
                    >
                      <EyeOff className="h-4 w-4 mr-1" />
                      Hide
                    </Button>
                  )}
                  {product.status === 'inactive' && (
                    <Button
                      size="sm"
                      onClick={() => updateProductStatus(product.id, 'active')}
                      disabled={updatingIds.has(product.id)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Publish
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found matching your criteria.</p>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Edit Product: {editingProduct.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Product Name</Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="edit-specs">Detailed Specifications</Label>
                  <Textarea
                    id="edit-specs"
                    value={editForm.detailed_specs}
                    onChange={(e) => setEditForm(prev => ({ ...prev, detailed_specs: e.target.value }))}
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-price">Price (₵)</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      value={editForm.price}
                      onChange={(e) => setEditForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-category">Category</Label>
                    <Input
                      id="edit-category"
                      value={editForm.category}
                      onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-condition">Condition</Label>
                  <select
                    id="edit-condition"
                    value={editForm.condition}
                    onChange={(e) => setEditForm(prev => ({ ...prev, condition: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="New">New</option>
                    <option value="Open Box">Open Box</option>
                    <option value="Used">Used</option>
                    <option value="Refurbished">Refurbished</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                <Button variant="outline" onClick={() => setEditingProduct(null)} className="flex-1">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={saveProductChanges} className="flex-1" disabled={updatingIds.has(editingProduct.id)}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagePage;