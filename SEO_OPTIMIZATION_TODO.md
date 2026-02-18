# SEO & Performance Optimization Todo List

## 1. SEO — CRITICAL PRIORITY

### Server-Side Rendering (SSR)

- [x] **Next.js platform confirmed** - Using Next.js with SSR capabilities
- [ ] Ensure all product pages are server-rendered with proper HTML content
- [ ] Verify crawlers can see full page content

### Meta Tags Implementation

- [x] **Basic meta tags implemented** - Found in layout.tsx with title, description, Open Graph
- [x] **Product-specific meta tags added** - Dynamic meta tags for individual product pages
- [x] **Open Graph tags fully implemented** - Enhanced with product-specific data
- [x] **Product-specific meta tags implemented:**
  - [x] `<meta property="product:price:amount">`
  - [x] `<meta property="product:price:currency">`
  - [x] `<meta property="product:availability">`
  - [x] `<meta property="product:condition">`

### Technical SEO

- [x] **sitemap.ts enhanced** - Dynamic sitemap with all product pages
- [x] **robots.ts implemented** - Basic robots.txt with sitemap reference
- [x] **Structured data implemented** - JSON-LD Product schema on all product pages
- [x] **Target keywords optimized** - Added relevant keywords to meta tags

### Current SEO Status

- [x] **Google PageSpeed SEO: 91/100** - Basic meta tags check passes
- [ ] **Content crawlability test** - Verify Google can actually read product content

---

## 2. PERFORMANCE OPTIMIZATION

### Current PageSpeed Scores (Mobile)

- Performance: 70/100 :warning:
- Accessibility: 85/100
- Best Practices: 92/100
- SEO: 91/100

### Critical Performance Issues

| Issue                                | Impact                          | Status                |
| ------------------------------------ | ------------------------------- | --------------------- |
| **Largest Contentful Paint: 26.8s**  | CRITICAL - 27 seconds to render | [ ] Fix Target: <4s   |
| **First Contentful Paint: 2.7s**     | Needs improvement               | [ ] Fix Target: <1.5s |
| **Image delivery: 6,060 KB savings** | Major                           | [ ] Optimize images   |
| **Network payload: 6,957 KB total**  | Heavy                           | [ ] Reduce payload    |
| **Render-blocking resources: 820ms** | Delay                           | [ ] Defer resources   |
| **Unused JavaScript: 89 KB**         | Minor                           | [ ] Tree-shake        |
| **4 long main-thread tasks**         | Jank                            | [x] Break up tasks    |
| **Images missing width/height**      | Layout shifts                   | [x] Add attributes    |
| **Inefficient cache: 710 KB**        | Slow repeat visits              | [x] Set headers       |

### Priority Performance Fixes

1. [x] **Image optimization** - WebP/AVIF formats, proper sizing, lazy loading implemented
2. [ ] **Reduce LCP from 26.8s to <4s** - Critical for African mobile networks
3. [ ] **Code splitting** - Load only JS needed for current page
4. [ ] **CDN implementation** - Cloudflare for African edge locations

---

## 3. SEARCH FUNCTIONALITY

### Product Search & Filters

- [x] **Search bar implemented** - Comprehensive search functionality in navbar
- [x] **Basic filter implementation exists** - Found SidebarFilter.tsx with category/brand filters
- [x] **Enhanced filter implementation:**
  - [x] Brand filter (HP, Dell, Lenovo, Apple, ASUS, etc.) - Already implemented
  - [x] Category filter - Already implemented
  - [ ] Condition filter (New, Open Box, Renewed, Used)
  - [ ] Price range filter (Under ₵3,000 / ₵3,000-5,000 / ₵5,000-8,000 / ₵8,000+)
  - [ ] RAM filter (4GB, 8GB, 16GB)
  - [ ] Storage filter (128GB, 256GB, 512GB, 1TB)
  - [ ] Screen size filter (12", 13", 14", 15.6", 16"+)
- [ ] **Sort options:**
  - [ ] Price low-high
  - [ ] Price high-low
  - [ ] Newest first
  - [ ] Most popular

---

## 4. GOOGLE REVIEWS INTEGRATION

### Customer Reviews Display

- [ ] Add "Customer Reviews" section on homepage (below Featured Laptops)
- [ ] Display Google rating stars + review count
- [ ] Show 3-5 most recent/best reviews with customer names
- [ ] Link to full Google Reviews page
- [ ] Choose integration method:
  - [ ] Google Places API
  - [ ] Widget service (Elfsight, Widget.io, Trustpilot)

---

## 5. META PIXEL & ANALYTICS INTEGRATION

### Meta (Facebook/Instagram) Pixel

- [ ] Install Meta Pixel base code
- [ ] Initialize pixel with client's Pixel ID
- [ ] Implement PageView tracking
- [ ] Add event tracking for:
  - [ ] Product views
  - [ ] Add to cart
  - [ ] Purchase/checkout
  - [ ] Search queries

### Analytics Setup

- [ ] Google Analytics 4 implementation
- [ ] Enhanced ecommerce tracking
- [ ] Conversion goal setup

---

## 6. VERIFICATION & TESTING

### SEO Verification

- [ ] Google Search Console setup
- [ ] Mobile-friendly test
- [ ] Page speed test post-optimization
- [ ] Rich results test for structured data
- [ ] Index coverage report

### Performance Testing

- [ ] Google PageSpeed Insights test (target: Performance >90)
- [ ] GTmetrix test
- [ ] WebPageTest.org (African locations)
- [ ] Real user monitoring setup

---

## IMPLEMENTATION PRIORITY

### Phase 1 - Critical (Week 1)

1. [x] **Next.js platform confirmed** - Already using Next.js
2. [ ] Verify SSR implementation for product pages
3. [ ] Image optimization (6MB savings)
4. [ ] Add unique meta tags per product page
5. [ ] Add search bar functionality

### Phase 2 - High Priority (Week 2)

1. [ ] Structured data implementation
2. [ ] Enhance sitemap with dynamic product pages
3. [ ] Google Reviews integration
4. [ ] Meta Pixel setup
5. [ ] Enhanced filtering (price, RAM, storage, etc.)

### Phase 3 - Medium Priority (Week 3)

1. [ ] Sort options implementation
2. [ ] CDN implementation
3. [ ] Analytics setup
4. [ ] Performance fine-tuning
5. [ ] Google Search Console setup

---

## NOTES

- **Current platform**: Next.js (good foundation for SSR) ✅
- **Critical issue**: 26.8s LCP is causing user abandonment
- **Target market**: Ghana/Africa - consider 3G/4G mobile networks
- **Business impact**: Zero organic search traffic due to SPA rendering issues

## ALREADY IMPLEMENTED ✅

### SEO Foundation

- ✅ Next.js platform with SSR capabilities
- ✅ Basic meta tags in layout.tsx (title, description, Open Graph)
- ✅ sitemap.ts with basic routes
- ✅ robots.ts with sitemap reference
- ✅ Google PageSpeed SEO score: 91/100

### Search & Filtering

- **SidebarFilter.tsx with category and brand filtering**
- **Mobile-responsive filter implementation**
- **Dynamic category and brand extraction from products**

### Performance

- [x] **Next.js optimization features available** - Image optimization, code splitting
- [x] **Dynamic imports for code splitting** - React Query DevTools
- [x] **Image optimization setup** - Next.js Image component with WebP/AVIF support
- [x] **Proper image sizing and lazy loading** - Added sizes and loading attributes
