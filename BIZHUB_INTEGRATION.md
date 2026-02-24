# Bizhub Integration Setup Guide

This guide explains how to connect your Payless4Tech website to your Bizhub inventory management system for real-time product data.

## 🎯 Overview

**Before Integration:**
- Website used Supabase database for products
- Manual product entry required
- No real-time inventory sync

**After Integration:**
- Website pulls products directly from Bizhub
- Single source of truth = Bizhub inventory
- Real-time stock updates
- No duplicate data management

## 📋 Prerequisites

1. **Bizhub deployed on Railway** ✅ (already done)
2. **Payless4Tech website** ✅ (already done) 
3. **Products in Bizhub inventory** ✅ (67 laptops already imported)

## 🔐 Step 1: Configure Bizhub API Key

### 1.1 Set Environment Variables in Railway

Go to your Bizhub project on Railway and add these environment variables:

```bash
STOREFRONT_API_KEY=p4t_live_sk_xyz123abc456  # Create a secure random key
STOREFRONT_ALLOWED_ORIGINS=https://payless4tech.com,https://www.payless4tech.com
```

**Generate API Key:**
```bash
# Use any secure random generator, e.g.:
node -e "console.log('p4t_live_sk_' + require('crypto').randomBytes(20).toString('hex'))"
```

### 1.2 Restart Bizhub Service
After adding environment variables, restart the Bizhub service on Railway.

## 🌐 Step 2: Configure Website Environment

### 2.1 Create .env.local file
In your website root directory, create `.env.local`:

```bash
# Copy from .env.example and add:
NEXT_PUBLIC_BIZHUB_API_URL=https://bizhub-production-0622.up.railway.app/api/v1/storefront
NEXT_PUBLIC_BIZHUB_API_KEY=p4t_live_sk_xyz123abc456  # Same as Bizhub STOREFRONT_API_KEY
NEXT_PUBLIC_SITE_URL=https://payless4tech.com
```

### 2.2 Install Dependencies (if needed)
```bash
npm install
# or
yarn install
```

## 🧪 Step 3: Test Integration

### 3.1 Test API Connection
```bash
# Test if Bizhub API is accessible
curl -H "x-api-key: your_api_key_here" \
  "https://bizhub-production-0622.up.railway.app/api/v1/storefront/products?limit=5"
```

### 3.2 Test Website Locally
```bash
npm run dev
```

Visit http://localhost:3000 and verify:
- [ ] Products load on homepage
- [ ] Shop page shows products with filtering
- [ ] Individual product pages work
- [ ] Real inventory quantities display

## 🚀 Step 4: Deploy Website

### 4.1 Deploy to Production
```bash
# Build and deploy your website
npm run build
```

### 4.2 Update Production Environment
Set the same environment variables in your website hosting platform (Vercel, Netlify, etc.).

## 🔍 Step 5: Verification Checklist

### API Endpoints Working:
- [ ] `GET /storefront/products` - Product listing
- [ ] `GET /storefront/products/featured` - Featured products  
- [ ] `GET /storefront/products/:id` - Single product
- [ ] `GET /storefront/categories` - Categories list

### Website Features:
- [ ] Homepage shows products from Bizhub
- [ ] Shop page filtering works (brand, category)
- [ ] Product detail pages load correctly
- [ ] Stock levels update in real-time
- [ ] Add to cart functionality works

### Data Mapping:
- [ ] Product names display correctly
- [ ] Prices show in GHS (from Bizhub)
- [ ] Product specs/descriptions show
- [ ] Product conditions (New, Used, etc.) display
- [ ] Categories map correctly (Laptop, Phone, etc.)

## 🛠 Troubleshooting

### Common Issues:

**1. "Invalid or missing API key"**
- Check STOREFRONT_API_KEY in Bizhub Railway env
- Verify NEXT_PUBLIC_BIZHUB_API_KEY matches exactly
- Restart both services after env changes

**2. "CORS Error" in browser**
- Check STOREFRONT_ALLOWED_ORIGINS includes your domain
- Include both www and non-www versions
- Restart Bizhub service after changes

**3. "Products not loading"**
- Verify Bizhub has products with quantity > 0
- Check browser network tab for API errors
- Verify API URL is accessible from browser

**4. "Wrong product data"**
- Check data mapping in `lib/bizhub-api.ts`
- Verify product interface matches Bizhub API response
- Test API directly with curl/Postman

### Debug Commands:

```bash
# Check Bizhub API directly
curl -H "x-api-key: YOUR_KEY" \
  "https://bizhub-production-0622.up.railway.app/api/v1/storefront/products"

# Check categories
curl -H "x-api-key: YOUR_KEY" \
  "https://bizhub-production-0622.up.railway.app/api/v1/storefront/categories"

# Check specific product
curl -H "x-api-key: YOUR_KEY" \
  "https://bizhub-production-0622.up.railway.app/api/v1/storefront/products/1"
```

## 📊 Data Flow

```
Bizhub Database → Bizhub Storefront API → Website → Customer
```

1. **Add/Update product in Bizhub** (inventory management)
2. **API immediately reflects changes** (real-time)
3. **Website shows updated data** (next page load)
4. **Customer sees current inventory** (accurate stock levels)

## 🔮 Next Steps (Optional)

### Advanced Features:
1. **Webhook notifications** - Real-time updates when inventory changes
2. **Image management** - Upload product images to Bizhub
3. **Admin panel integration** - Manage products through website admin
4. **Search optimization** - Enhanced search with Elasticsearch
5. **Caching layer** - Redis for faster page loads

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Test API endpoints directly (use curl/Postman)
4. Check browser developer tools for errors

---

**Integration completed!** Your website now pulls live inventory data from Bizhub. 🎉