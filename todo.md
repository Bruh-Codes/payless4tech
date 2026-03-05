## 1. SEO — CRITICAL PRIORITY

### Problem

The site is a client-side React SPA. Google's crawler sees almost nothing — just "Payless4Tech Marketplace." No product pages, no categories, no content is indexed. This means zero organic search traffic.

### What Needs to Happen

- **Implement Server-Side Rendering (SSR)** — Migrate to **Next.js** (recommended) or add a pre-rendering service like Prerender.io / Rendertron
- Every product page must be server-rendered with proper HTML content visible to crawlers
- **Add meta tags to every page:**
    - `<title>` — unique per page (e.g., "HP EliteBook 845 G7 — Refurbished Laptop | Payless4Tech Ghana")
    - `<meta name="description">` — unique per product with specs and price
    - `<meta property="og:title">`, `og:description`, `og:image` — for social sharing (critical for Instagram/Facebook ads)
    - `<meta property="og:type" content="product">` for product pages
    - `<meta property="product:price:amount">` and `product:price:currency` for product pages
- **Generate a sitemap.xml** — auto-generated, listing all product pages, category pages, and static pages. Submit to Google Search Console.
- **Add robots.txt** — allow all crawlers
- **Implement structured data (JSON-LD)** on product pages:
    `json
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "HP EliteBook 845 G7",
    "description": "...",
    "image": "...",
    "brand": { "@type": "Brand", "name": "HP" },
    "offers": {
      "@type": "Offer",
      "price": "3500",
      "priceCurrency": "GHS",
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/RefurbishedCondition"
    }
  }
  `
- **Target keywords:** "refurbished laptops Ghana," "used laptops Accra," "HP EliteBook Ghana," "affordable laptops Ghana," "renewed laptops Ghana"

### SEO Score (Current)

Google PageSpeed: **91/100 SEO** — but this only checks basic meta tags, NOT whether content is actually crawlable. The real SEO issue is the SPA rendering.

---

## 2. PERFORMANCE OPTIMIZATION

### Current PageSpeed Scores (Mobile)

- **Performance: 70/100** :warning:
- **Accessibility: 85/100**
- **Best Practices: 92/100**
- **SEO: 91/100**

### Key Performance Issues

| Issue                                         | Impact                                                     | Fix                                                                                |
| --------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Largest Contentful Paint: 26.8s**           | CRITICAL — page takes 27 seconds to fully render on mobile | Optimize images, lazy load below-fold content, SSR                                 |
| **First Contentful Paint: 2.7s**              | Needs improvement                                          | Reduce render-blocking resources (est. 820ms savings)                              |
| **Image delivery: 6,060 KB savings possible** | Major                                                      | Convert images to WebP/AVIF, resize to actual display size, implement lazy loading |
| **Network payload: 6,957 KB total**           | Heavy                                                      | Compress images, code-split JavaScript, tree-shake unused code                     |
| **Render-blocking resources**                 | 820ms delay                                                | Defer non-critical CSS/JS, inline critical CSS                                     |
| **Unused JavaScript: 89 KB**                  | Minor                                                      | Tree-shake and code-split                                                          |
| **4 long main-thread tasks**                  | Jank                                                       | Break up heavy JS execution                                                        |
| **Images missing width/height**               | Layout shifts                                              | Add explicit width and height attributes to all `<img>` tags                       |
| **Inefficient cache: 710 KB**                 | Repeat visits slow                                         | Set proper Cache-Control headers for static assets (images, CSS, JS)               |

### Priority Fixes

1. **Image optimization is the #1 win** — 6MB of potential savings. Serve WebP, resize images to actual display dimensions, lazy load images below the fold
2. **LCP of 26.8s is unacceptable** — on African mobile networks (3G/4G), this means most users bounce before seeing the page. Target < 4s
3. **Code splitting** — only load JS needed for the current page
4. **CDN** — serve static assets from a CDN with edge locations close to West Africa (Cloudflare is free and has good African coverage)

---

## 3. SEARCH FUNCTIONALITY

### Add Product Search & Filters

The shop page has 40+ products with no way to search or filter. Add:

- **Search bar** — prominent, in the header. Search by product name, brand, specs
- **Filter sidebar or top bar:**
    - Brand (HP, Dell, Lenovo, Apple, ASUS, etc.)
    - Condition (New, Open Box, Renewed, Used)
    - Price range (slider or brackets: Under ₵3,000 / ₵3,000-5,000 / ₵5,000-8,000 / ₵8,000+)
    - RAM (4GB, 8GB, 16GB)
    - Storage (128GB, 256GB, 512GB, 1TB)
    - Screen size (12", 13", 14", 15.6", 16"+)
    - Touchscreen (Yes/No)
- **Sort by:** Price low-high, Price high-low, Newest, Most popular

---

## 4. GOOGLE REVIEWS INTEGRATION

### Pull in Google Business Reviews

Payless4Tech has Google reviews. Display them on the site to build trust:

- Add a "Customer Reviews" section on the homepage (below Featured Laptops)
- Show Google rating stars + review count
- Display 3-5 most recent/best reviews with customer names
- Link to full Google Reviews page
- Options: Use Google Places API, or a widget service like Elfsight, Widget.io, or Trustpilot

---

## 5. META PIXEL & ANALYTICS INTEGRATION

### Meta (Facebook/Instagram) Pixel

This is required for running ads that convert. Install:

```html
<!-- Meta Pixel Code -->
<script>
	!(function (f, b, e, v, n, t, s) {
		if (f.fbq) return;
		n = f.fbq = function () {
			n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
		};
		if (!f._fbq) f._fbq = n;
		n.push = n;
		n.loaded = !0;
		n.version = "2.0";
		n.queue = [];
		t = b.createElement(e);
		t.async = !0;
		t.src = v;
		s = b.getElementsByTagName(e)[0];
		s.parentNode.insertBefore(t, s);
	})(
		window,
		document,
		"script",
		"https://connect.facebook.net/en_US/fbevents.js",
	);
	fbq("init", "YOUR_PIXEL_ID");
	fbq("track", "PageView");
</script>
schema.orgRefurbishedCondition - Schema.org Enumeration MemberSchema.org
Enumeration Member: RefurbishedCondition - Indicates that the item is
refurbished.
```
