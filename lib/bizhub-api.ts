/**
 * Bizhub API Integration
 * Connects to your Bizhub storefront API for real-time inventory data
 */

const BIZHUB_API_URL = process.env.NEXT_PUBLIC_BIZHUB_API_URL || 'https://bizhub-production-0622.up.railway.app/api/v1/storefront';
const BIZHUB_API_KEY = process.env.NEXT_PUBLIC_BIZHUB_API_KEY;

export interface BizhubProduct {
  id: number;
  name: string;
  make: string;
  model: string;
  category: string;
  asset_type: string;
  condition: string;
  description: string;
  specs: {
    cpu?: string;
    ram?: string;
    storage?: string;
    screen_size?: string;
    gpu?: string;
    resolution?: string;
    battery_health?: string;
    touchscreen?: boolean;
    features?: string[];
  };
  price: number;
  currency: string;
  images: string[];
  quantity: number;
  in_stock: boolean;
  asset_tag: string;
  featured: boolean;
  created_at: string;
}

export interface BizhubApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface BizhubProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  asset_type?: string;
  condition?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  inStock?: boolean;
}

class BizhubApiError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'BizhubApiError';
  }
}

async function bizhubFetch<T>(endpoint: string, options: RequestInit = {}): Promise<BizhubApiResponse<T>> {
  if (!BIZHUB_API_KEY) {
    throw new BizhubApiError('CONFIG_ERROR', 'Bizhub API key not configured');
  }

  const url = `${BIZHUB_API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': BIZHUB_API_KEY,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new BizhubApiError(
      data.error?.code || 'API_ERROR',
      data.error?.message || `HTTP ${response.status}: ${response.statusText}`
    );
  }

  return data;
}

/**
 * Get products from Bizhub storefront API
 */
export async function getProducts(params: BizhubProductsParams = {}): Promise<BizhubApiResponse<BizhubProduct[]>> {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.category) searchParams.set('category', params.category);
  if (params.asset_type) searchParams.set('asset_type', params.asset_type);
  if (params.condition) searchParams.set('condition', params.condition);
  if (params.brand) searchParams.set('brand', params.brand);
  if (params.minPrice) searchParams.set('minPrice', params.minPrice.toString());
  if (params.maxPrice) searchParams.set('maxPrice', params.maxPrice.toString());
  if (params.search) searchParams.set('search', params.search);
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.inStock !== undefined) searchParams.set('inStock', params.inStock.toString());

  const queryString = searchParams.toString();
  const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
  
  return bizhubFetch<BizhubProduct[]>(endpoint);
}

/**
 * Get featured products from Bizhub
 */
export async function getFeaturedProducts(): Promise<BizhubApiResponse<BizhubProduct[]>> {
  return bizhubFetch<BizhubProduct[]>('/products/featured');
}

/**
 * Get single product by ID
 */
export async function getProduct(id: number): Promise<BizhubApiResponse<BizhubProduct>> {
  return bizhubFetch<BizhubProduct>(`/products/${id}`);
}

/**
 * Get available categories
 */
export async function getCategories(): Promise<BizhubApiResponse<string[]>> {
  return bizhubFetch<string[]>('/categories');
}

/**
 * Convert Bizhub product to website product format
 */
export function mapBizhubProduct(product: BizhubProduct) {
  return {
    id: product.id.toString(),
    name: product.name,
    price: product.price,
    condition: product.condition,
    image_url: product.images[0] || null,
    original_price: null, // Not provided by Bizhub API
    category: product.category.toLowerCase(),
    description: product.description,
    detailed_specs: JSON.stringify(product.specs),
    created_at: product.created_at,
    updated_at: product.created_at, // Use created_at as fallback
    // Additional fields from Bizhub
    make: product.make,
    model: product.model,
    asset_type: product.asset_type,
    currency: product.currency,
    images: product.images,
    quantity: product.quantity,
    in_stock: product.in_stock,
    asset_tag: product.asset_tag,
    featured: product.featured,
    specs: product.specs,
  };
}