"use client";

import { useState, useEffect } from "react";
import { getProducts, getFeaturedProducts, mapBizhubProduct, type BizhubProductsParams } from "@/lib/bizhub-api";
import { toast } from "sonner";

export interface Product {
  id: string;
  name: string;
  price: number;
  condition: string;
  image_url: string | null;
  original_price: number | null;
  category: string;
  description: string | null;
  detailed_specs: string | null;
  created_at: string;
  updated_at: string;
  // Additional fields from Bizhub
  make?: string;
  model?: string;
  asset_type?: string;
  currency?: string;
  images?: string[];
  quantity?: number;
  in_stock?: boolean;
  asset_tag?: string;
  featured?: boolean;
  specs?: any;
}

export function useProducts(params: BizhubProductsParams = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getProducts(params);

      if (!response.success) {
        const errorMsg = response.error?.message || "Failed to load products";
        setError(errorMsg);
        toast.error("Error loading products", {
          description: errorMsg,
        });
        return;
      }

      const mappedProducts = response.data.map(mapBizhubProduct);
      setProducts(mappedProducts);

    } catch (err: any) {
      const errorMsg = err.message || "Please try again later";
      setError(errorMsg);
      console.error("Error fetching products:", err);
      toast.error("Error loading products", {
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [JSON.stringify(params)]); // Re-fetch when params change

  return {
    products,
    isLoading,
    error,
    refetch: fetchProducts,
  };
}

export function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getFeaturedProducts();

      if (!response.success) {
        const errorMsg = response.error?.message || "Failed to load featured products";
        setError(errorMsg);
        toast.error("Error loading featured products", {
          description: errorMsg,
        });
        return;
      }

      const mappedProducts = response.data.map(mapBizhubProduct);
      setProducts(mappedProducts);

    } catch (err: any) {
      const errorMsg = err.message || "Please try again later";
      setError(errorMsg);
      console.error("Error fetching featured products:", err);
      toast.error("Error loading featured products", {
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  return {
    products,
    isLoading,
    error,
    refetch: fetchFeaturedProducts,
  };
}