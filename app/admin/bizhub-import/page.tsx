"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getProducts, type BizhubProduct } from "@/lib/bizhub-api";
import { Search, Import, Check, X, Eye, Plus } from "lucide-react";
import Image from "next/image";

interface ImportableProduct extends BizhubProduct {
  isImported?: boolean;
  isPublished?: boolean;
}

const BizhubImportPage = () => {
  const [bizhubProducts, setBizhubProducts] = useState<ImportableProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ImportableProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [importingIds, setImportingIds] = useState<Set<number>>(new Set());

  // Import enhancement modal state
  const [selectedProduct, setSelectedProduct] = useState<ImportableProduct | null>(null);
  const [enhancedDescription, setEnhancedDescription] = useState("");
  const [enhancedSpecs, setEnhancedSpecs] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [customPrice, setCustomPrice] = useState<number | null>(null);

  useEffect(() => {
    fetchBizhubProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [bizhubProducts, searchTerm, selectedCategory]);

  const fetchBizhubProducts = async () => {
    setIsLoading(true);
    try {
      // Get all products from Bizhub
      const response = await getProducts({ limit: 1000, inStock: true });
      
      if (!response.success) {
        throw new Error(response.error?.message || "Failed to fetch Bizhub products");
      }

      // Check which products are already imported via API
      const existingResponse = await fetch('/api/products?status=all&limit=1000');
      const existingResult = await existingResponse.json();
      const existingProducts = existingResult.success ? existingResult.data : [];

      const existingMap = new Map(
        existingProducts?.map((p: any) => [p.bizhub_asset_id, p.status === 'published']) || []
      );

      const productsWithStatus = response.data.map(product => ({
        ...product,
        isImported: existingMap.has(product.id),
        isPublished: existingMap.get(product.id) === true
      }));

      setBizhubProducts(productsWithStatus);
    } catch (error: any) {
      console.error("Error fetching Bizhub products:", error);
      toast.error("Failed to load Bizhub inventory", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = bizhubProducts;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredProducts(filtered);
  };

  const openImportModal = (product: ImportableProduct) => {
    setSelectedProduct(product);
    setEnhancedDescription(product.description || "");
    setEnhancedSpecs(JSON.stringify(product.specs, null, 2));
    setSelectedImages(product.images || []);
    setCustomPrice(product.price);
  };

  const importProductToWebsite = async () => {
    if (!selectedProduct) return;

    setImportingIds(prev => new Set([...prev, selectedProduct.id]));

    try {
      // Create product via API route
      const productData = {
        bizhub_asset_id: selectedProduct.id,
        name: selectedProduct.name,
        description: enhancedDescription,
        short_description: enhancedSpecs,
        price: customPrice || selectedProduct.price,
        compare_at_price: selectedProduct.price,
        currency: selectedProduct.currency || 'GHS',
        stock_quantity: selectedProduct.quantity,
        featured_image: selectedImages[0] || null,
        gallery_images: selectedImages.slice(1),
        category_id: 1, // Laptops
        status: 'draft'
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      toast.success("Product imported successfully!", {
        description: `${selectedProduct.name} has been added to your website inventory as a draft.`
      });

      // Update local state
      setBizhubProducts(prev => 
        prev.map(p => 
          p.id === selectedProduct.id 
            ? { ...p, isImported: true, isPublished: false }
            : p
        )
      );

      setSelectedProduct(null);
      
    } catch (error: any) {
      console.error("Error importing product:", error);
      toast.error("Failed to import product", {
        description: error.message
      });
    } finally {
      setImportingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedProduct.id);
        return newSet;
      });
    }
  };

  const quickImport = async (product: ImportableProduct) => {
    setImportingIds(prev => new Set([...prev, product.id]));

    try {
      const productData = {
        bizhub_asset_id: product.id,
        name: product.name,
        description: product.description || `${product.make} ${product.model} - ${product.condition}`,
        short_description: JSON.stringify(product.specs),
        price: product.price,
        compare_at_price: product.price,
        currency: product.currency || 'GHS',
        stock_quantity: product.quantity,
        featured_image: product.images?.[0] || null,
        gallery_images: product.images?.slice(1) || [],
        category_id: 1,
        status: 'draft'
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      toast.success("Product imported!", {
        description: `${product.name} imported as draft. You can enhance it before publishing.`
      });

      setBizhubProducts(prev => 
        prev.map(p => 
          p.id === product.id 
            ? { ...p, isImported: true, isPublished: false }
            : p
        )
      );

    } catch (error: any) {
      console.error("Error importing product:", error);
      toast.error("Failed to import product", {
        description: error.message
      });
    } finally {
      setImportingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }
  };

  const categories = Array.from(new Set(bizhubProducts.map(p => p.category)));

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading Bizhub inventory...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Import from Bizhub Inventory</h1>
        <p className="text-muted-foreground">
          Select products from your Bizhub inventory to enhance and publish to your website.
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
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{bizhubProducts.length}</div>
            <p className="text-sm text-muted-foreground">Total in Bizhub</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {bizhubProducts.filter(p => p.isImported).length}
            </div>
            <p className="text-sm text-muted-foreground">Imported</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {bizhubProducts.filter(p => p.isPublished).length}
            </div>
            <p className="text-sm text-muted-foreground">Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {bizhubProducts.filter(p => !p.isImported).length}
            </div>
            <p className="text-sm text-muted-foreground">Available to Import</p>
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
                <div className="flex gap-1 ml-2">
                  {product.isPublished && (
                    <Badge variant="default" className="bg-green-500 text-white">
                      <Eye className="h-3 w-3 mr-1" />
                      Live
                    </Badge>
                  )}
                  {product.isImported && !product.isPublished && (
                    <Badge variant="secondary">
                      Draft
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {product.images[0] && (
                <div className="mb-4 relative h-32 bg-gray-100 rounded-md overflow-hidden">
                  <Image
                    src={product.images[0]}
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
                <div className="flex justify-between text-sm">
                  <span>Stock:</span>
                  <span>{product.quantity} units</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Category:</span>
                  <span>{product.category}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {!product.isImported ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => quickImport(product)}
                      disabled={importingIds.has(product.id)}
                      className="flex-1"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Quick Import
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => openImportModal(product)}
                      disabled={importingIds.has(product.id)}
                      className="flex-1"
                    >
                      <Import className="h-4 w-4 mr-1" />
                      Enhance & Import
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" disabled className="w-full">
                    <Check className="h-4 w-4 mr-1" />
                    Already Imported
                  </Button>
                )}
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

      {/* Import Enhancement Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Enhance Product: {selectedProduct.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Enhanced Description</Label>
                  <Textarea
                    id="description"
                    value={enhancedDescription}
                    onChange={(e) => setEnhancedDescription(e.target.value)}
                    rows={3}
                    placeholder="Add marketing copy, key features, or detailed description..."
                  />
                </div>

                <div>
                  <Label htmlFor="specs">Technical Specifications (JSON)</Label>
                  <Textarea
                    id="specs"
                    value={enhancedSpecs}
                    onChange={(e) => setEnhancedSpecs(e.target.value)}
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="price">Custom Price (₵)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={customPrice || ""}
                    onChange={(e) => setCustomPrice(parseFloat(e.target.value) || null)}
                    placeholder={`Original: ₵${selectedProduct.price}`}
                  />
                </div>

                <div>
                  <Label>Images</Label>
                  <div className="text-sm text-muted-foreground mb-2">
                    {selectedImages.length} image(s) from Bizhub. You can add more images after importing.
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedImages.map((url, index) => (
                      <div key={index} className="relative h-20 bg-gray-100 rounded overflow-hidden">
                        <Image src={url} alt={`Product ${index + 1}`} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedProduct(null)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={importProductToWebsite} className="flex-1">
                  <Import className="h-4 w-4 mr-2" />
                  Import Product
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BizhubImportPage;