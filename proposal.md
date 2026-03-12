# Payless4Tech: Security, Scalability, and Database Modernization Proposal

## 1) Executive Summary

This project needs a production-grade backend hardening phase before scaling traffic.

Current architecture still performs many admin and order operations directly from the browser via Supabase public client queries. To secure customer/order data and prepare for growth, we need to:

1. Move sensitive data access to server APIs.
2. Enforce strict table-level Row Level Security (RLS).
3. Prepare database hosting for predictable scaling and egress costs.

This is not a minor patch. It is a structured engineering project that impacts security, data access architecture, and operations.

---

## 2) Why This Work Is Required

### Security and Data Protection
- Admin pages currently query/update protected tables from client code.
- Once proper RLS is enabled, those calls will fail unless moved server-side.
- Leaving this as-is increases risk of unauthorized access patterns and data leakage.

### Reliability Under Growth
- As traffic increases, direct client queries and broad fetch patterns become expensive and slower.
- Order, preorder, archive, and analytics views need server-mediated queries, paging, and controlled access.

### Cost and Scaling
- Egress and query volume can grow quickly with traffic.
- A clear hosting strategy is needed now: continue with managed Supabase PostgreSQL or migrate to a dedicated hosted PostgreSQL setup (Neon/RDS/Cloud SQL/etc.) with known cost envelopes.

---

## 3) Scope of Work

## Phase A: Security Refactor (Mandatory)
- Move sensitive table operations from client components to authenticated Next.js API routes.
- Enforce role checks in API routes.
- Keep service-role usage strictly server-side.

Tables in scope:
- `sales`
- `sale_items`
- `preorders` (admin reads/updates)
- `archived_sales`
- `archived_preorders`
- admin writes on `products` and `product_images`
- admin slideshow tables if retained

Deliverables:
- New API endpoints for admin orders/preorders/archives/products actions.
- Frontend switched from direct Supabase writes to API calls.
- Regression-tested admin flows.

## Phase B: RLS Policy Rollout (Mandatory)
- Enable RLS across core tables.
- Apply least-privilege policies per table purpose.
- Validate storefront read access and form submit behavior.
- Validate admin behavior exclusively through server APIs.

Deliverables:
- Versioned SQL policy scripts.
- Environment rollout checklist (dev/staging/prod).
- Rollback plan for policy changes.

## Phase C: Database Hosting and Scaling Strategy (Recommended)
- Evaluate current and projected load (orders, read traffic, image/storage egress).
- Decide hosting direction:
  - Option 1: Stay on managed Supabase PostgreSQL with plan tuning.
  - Option 2: Migrate to dedicated hosted PostgreSQL for cost/performance control.
- If migrating, execute a low-risk migration plan.

Deliverables:
- Cost/performance comparison.
- Migration runbook (schema, data copy, cutover, rollback).
- Post-cutover validation checklist.

## Phase D: Performance and Observability (Recommended)
- Add indexes for key filters/sorts used by admin and storefront.
- Standardize pagination/search on server endpoints.
- Add operational logging/alerts for payment/order flows.

Deliverables:
- Index and query optimization changelog.
- Monitoring dashboard recommendations.
- Incident checklist for order/payment failures.

---

## 4) Engineering Effort Estimate

These are realistic implementation ranges:

- Phase A: 4 to 7 engineering days
- Phase B: 2 to 4 engineering days
- Phase C:
  - decision + architecture only: 1 to 2 days
  - full migration execution: 3 to 6 days
- Phase D: 2 to 4 days

Expected total:
- Without DB migration: 8 to 13 days
- With DB migration: 11 to 19 days

Note: Final estimate depends on staging availability, testing cycle, and deployment approvals.

---

## 5) Commercial Framing (Client-Safe)

This is billable infrastructure and security engineering work, not routine UI maintenance.

Reasons:
- It changes how critical data flows through the system.
- It introduces access control enforcement and compliance-grade safeguards.
- It includes production risk management (rollout, rollback, migration safety).
- It directly affects uptime, data integrity, and long-term operating cost.

---

## 6) Risks If Deferred

- RLS enablement could break admin/order operations unexpectedly later.
- Sensitive business tables remain difficult to lock down safely.
- Scaling costs may rise without predictable architecture controls.
- Production incident risk increases as order volume grows.

---

## 7) Proposed Next Step

Approve Phase A + Phase B immediately as mandatory baseline security work.  
Then decide Phase C (stay vs migrate database) using a short architecture/cost decision workshop.

