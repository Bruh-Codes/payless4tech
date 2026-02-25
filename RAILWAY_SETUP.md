# Railway PostgreSQL Setup Guide

## 🚀 Quick Setup Steps

### 1. Add PostgreSQL to Railway Project

1. **Go to your Railway dashboard:** https://railway.app/dashboard
2. **Select your existing Bizhub project** 
3. **Click "+ Add Service"**
4. **Select "PostgreSQL"** from the database options
5. **Wait for deployment** (~2 minutes)

### 2. Get Database Connection String

1. **Click on the PostgreSQL service**
2. **Go to "Variables" tab**
3. **Copy the `DATABASE_URL`** value
   - Format: `postgresql://username:password@host:port/database`

### 3. Run Database Setup

1. **Connect to your PostgreSQL database:**
   ```bash
   railway connect postgresql
   ```
   
2. **Or use psql directly:**
   ```bash
   psql "your-database-url-here"
   ```

3. **Run the setup script:**
   ```sql
   \i railway/setup-database.sql
   ```

### 4. Update Environment Variables

#### In Railway (for backend services):
```bash
DATABASE_URL=postgresql://username:password@host:port/database
```

#### In Vercel (for frontend):
```bash
DATABASE_URL=your-railway-postgresql-url
NEXT_PUBLIC_BIZHUB_API_URL=https://bizhub-production-0622.up.railway.app/api/v1/storefront
NEXT_PUBLIC_BIZHUB_API_KEY=your_storefront_api_key
NEXT_PUBLIC_SITE_URL=https://payless4tech.com
```

## 🔄 Data Population from Bizhub

After database setup, populate with current Bizhub data:

### Option 1: Via Admin Interface
1. **Deploy the updated website**
2. **Go to `/admin/bizhub-import`**
3. **Import products you want to display**
4. **Enhance with descriptions/photos**
5. **Publish to make them live**

### Option 2: Bulk Import Script
```sql
-- Direct import from Bizhub API (run from Railway console)
-- This would be a one-time data migration script
```

## 🧪 Testing the Migration

1. **Deploy updated code to Vercel**
2. **Test admin panel:** `/admin/bizhub-import`
3. **Test product display:** Homepage should show products
4. **Verify functionality:** Add/edit/publish products

## 🔧 Troubleshooting

### Connection Issues:
- **Check DATABASE_URL** is correctly set in both Railway and Vercel
- **Verify PostgreSQL service** is running in Railway
- **Check firewall/networking** - Railway handles this automatically

### Migration Issues:
- **Check database logs** in Railway PostgreSQL service
- **Verify SQL syntax** - PostgreSQL is slightly different from Supabase
- **Test connection** with `railway connect postgresql`

### Performance Issues:
- **Add indexes** for frequently queried columns
- **Connection pooling** is already configured in the client
- **Monitor query performance** in Railway dashboard

## 📊 Architecture Benefits

### Before (Supabase):
```
Vercel → Internet → Supabase → Database
```

### After (Railway):
```
Vercel → Internet → Railway → PostgreSQL
```

### Performance Improvements:
- ✅ **Faster queries** - Same data center
- ✅ **Better reliability** - Single platform
- ✅ **Easier management** - One dashboard
- ✅ **Cost efficiency** - Consolidated billing

## 🎯 Success Metrics

After migration, you should have:
- ✅ **Faster page loads** - Reduced API latency
- ✅ **Simplified management** - Everything in Railway
- ✅ **Better monitoring** - Single dashboard view
- ✅ **Cost savings** - Potentially lower monthly costs
- ✅ **Scalability** - Easy to scale both services together

## 🔄 Rollback Plan

If issues occur:
1. **Keep Supabase running** during migration
2. **Switch environment variables** back to Supabase
3. **Redeploy with original code**
4. **Debug and retry migration**