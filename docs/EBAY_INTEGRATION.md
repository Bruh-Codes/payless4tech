# eBay Search Integration

This document explains the eBay search integration in the Payless4Tech navbar.

## Features

- **Environment-Based Search**: Search source configured via environment variable
- **React Query**: Production-ready caching, error handling, and retry logic
- **Real-time Results**: Search results appear in dropdown as you type
- **Unified Experience**: eBay products appear alongside local products in the same interface
- **Loading States**: Proper loading indicators for eBay API calls
- **Error Handling**: Graceful fallbacks when eBay API is unavailable

## Setup

1. **Get eBay API Credentials**:
   - Go to [eBay Developer Portal](https://developer.ebay.com/my/keys)
   - Create a new application
   - Copy your App ID

2. **Environment Configuration**:

   ```bash
   cp .env.local.example .env.local
   ```

   Add your configuration:

   ```
   NEXT_PUBLIC_EBAY_APP_ID=your_ebay_app_id_here
   NEXT_PUBLIC_SEARCH_SOURCE=local  # or 'ebay'
   ```

## Search Source Configuration

The search source is controlled by the `NEXT_PUBLIC_SEARCH_SOURCE` environment variable:

- **`local`**: Uses local product inventory (default)
- **`ebay`**: Uses eBay API for search results

Change this value in your `.env.local` file to switch between search sources without UI changes.

## How It Works

### Search Flow

1. User types in search bar
2. Search source determined by environment variable
3. Results appear in dropdown in real-time
4. Clicking any product navigates to search results page
5. eBay products are marked with blue "eBay" badge

### Technical Details

- **API**: eBay Finding API (v1)
- **Caching**: 5 minutes stale time, 10 minutes garbage collection
- **Retry Logic**: Up to 3 retries with exponential backoff
- **Rate Limiting**: Built-in with React Query
- **Mock Data**: Falls back to mock data when API key is missing

### Components

- `lib/ebay.ts`: Core eBay API functions
- `hooks/useEbaySearch.ts`: React Query hooks
- `components/navbar.tsx`: UI integration

## Production Considerations

### Performance

- Results are cached for 5 minutes
- Prefetching on focus for faster UX
- Debounced search to reduce API calls

### Error Handling

- Graceful fallback to empty results
- Retry logic for network failures
- Mock data for development

### Security

- API key stored in environment variables
- No sensitive data exposed to client
- Request timeouts to prevent hanging

## Customization

### Modify Search Parameters

Edit `lib/ebay.ts` to customize:

- Search filters (condition, price range, etc.)
- Result limits
- Sort orders
- Marketplace (US, UK, etc.)

### UI Customization

Update `components/navbar.tsx` to:

- Change toggle button styling
- Modify result display
- Add more search sources

## Troubleshooting

### No eBay Results

1. Check `NEXT_PUBLIC_EBAY_APP_ID` is set
2. Verify API key is valid
3. Check browser console for errors

### Slow Performance

1. Results are cached - first search may be slower
2. Check network connection
3. Monitor API rate limits

### Development Issues

- Mock data appears when API key is missing
- React Query DevTools show cache state
- Check Network tab for API calls
