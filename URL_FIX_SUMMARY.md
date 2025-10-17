# 🔧 Photo URL SAS Token Fix - Summary

## Issue Description

### Problem
Photos were not loading in the browser because the URLs didn't include SAS tokens for authentication.

**Error observed**:
```
GET https://ckcopilot.blob.core.windows.net/photo/photo-2.png
Status: 403 Forbidden
```

**Expected URL format**:
```
https://ckcopilot.blob.core.windows.net/photo/photo-2.png?sp=racwdli&st=...&sig=...
```

### Root Cause

The `uploadBlob` function was stripping the SAS token from the URL before returning it:

```typescript
// BEFORE (INCORRECT)
const publicUrl = blobUrl.split('?')[0];  // Removed SAS token!
return {
  url: publicUrl,  // URL without authentication
  blobName
};
```

This caused:
- ❌ Uploaded photos stored with URLs lacking SAS tokens
- ❌ Browser couldn't access images (403 Forbidden)
- ❌ Images appeared as broken links in the gallery

---

## Solution Implemented

### 1. Return Full URL with SAS Token

**File**: `src/lib/server/azure-storage.ts`

Changed `uploadBlob` to return the complete URL:

```typescript
// AFTER (CORRECT)
export async function uploadBlob(
  containerUrl: string,
  blobName: string,
  content: string | ArrayBuffer,
  contentType: string = 'application/json'
): Promise<BlobUploadResult> {
  const blobUrl = `${containerUrl.split('?')[0]}/${blobName}?${containerUrl.split('?')[1]}`;
  
  // Upload to Azure
  const response = await fetch(blobUrl, {
    method: 'PUT',
    headers: {
      'x-ms-blob-type': 'BlockBlob',
      'Content-Type': contentType
    },
    body
  });

  if (!response.ok) {
    throw new Error(`Failed to upload blob: ${response.status}`);
  }

  // ✅ Return full URL WITH SAS token
  return {
    url: blobUrl,  // Includes ?sp=racwdli&...&sig=...
    blobName
  };
}
```

### 2. Dynamic Token Refresh on Load

**File**: `src/lib/server/db.ts`

Added automatic SAS token refresh when loading photos from Azure:

```typescript
async function initializeCache() {
  photosCache = await getPhotosIndex();

  // ✅ Ensure all photo URLs have current SAS tokens
  photosCache = photosCache.map(photo => {
    // Extract blob name from URL
    if (photo.imageUrl && photo.imageUrl.includes('blob.core.windows.net/photo/')) {
      const blobName = photo.imageUrl.split('/photo/')[1].split('?')[0];
      // Reconstruct URL with current SAS token from .env
      photo.imageUrl = getPhotoBlobUrl(blobName);
    }
    return photo;
  });

  cacheInitialized = true;
}
```

### 3. Helper Function for URL Construction

**File**: `src/lib/server/azure-storage.ts`

Added utility to construct blob URLs with current SAS token:

```typescript
/**
 * Get blob URL with SAS token for a photo
 */
export function getPhotoBlobUrl(blobName: string): string {
  const baseUrl = AZURE_PHOTO_STORAGE_URL.split('?')[0];
  const sasToken = AZURE_PHOTO_STORAGE_URL.split('?')[1];
  return `${baseUrl}/${blobName}?${sasToken}`;
}
```

---

## How It Works Now

### Upload Flow

```
1. User uploads photo
   ↓
2. Image uploaded to Azure with SAS token
   ↓
3. Azure returns success
   ↓
4. getPhotoBlobUrl(blobName) constructs full URL
   ↓
5. URL with SAS token stored in photos-index.json
   ↓
6. Photo URL includes authentication
   ↓
7. Browser can access image ✅
```

### Load Flow

```
1. Server starts / Cache initializes
   ↓
2. Download photos-index.json from Azure
   ↓
3. For each photo:
   - Extract blob name (photo-1.jpg)
   - Reconstruct URL with current .env SAS token
   - Update imageUrl with fresh token
   ↓
4. Serve photos with valid URLs
   ↓
5. Browser displays images ✅
```

---

## Benefits of This Approach

### ✅ Immediate Fix
- Photos load correctly in browser
- No more 403 Forbidden errors
- Images display properly in gallery and modal

### ✅ Token Rotation Support
- Update `.env` with new SAS token
- Restart server
- All photo URLs automatically updated with new token
- No manual database updates needed

### ✅ Backward Compatible
- Works with photos uploaded before the fix
- Automatically refreshes old URLs on load
- No data migration required

### ✅ Future-Proof
- Easy to rotate tokens (just update .env)
- Works across token expirations
- Minimal code changes needed

---

## Testing the Fix

### 1. Upload a New Photo
```bash
# Start the app
pnpm dev

# Open browser: http://localhost:5173
# Click "Upload New Photo"
# Select an image
# Upload it
```

**Expected Result**:
- ✅ Photo appears in gallery
- ✅ Image loads correctly (not broken)
- ✅ Click photo → modal opens with full-size image

### 2. Check URL Format

In browser DevTools (F12) → Network tab:
```
GET https://ckcopilot.blob.core.windows.net/photo/photo-1.jpg?sp=racwdli&st=2025-10-17T08:06:52Z&se=2025-10-17T16:21:52Z&spr=https&sv=2024-11-04&sr=c&sig=...

Status: 200 OK ✅
```

### 3. Verify in Azure Portal

1. Go to https://portal.azure.com
2. Navigate to Storage Account: `ckcopilot`
3. Open `photo` container
4. See uploaded blobs: `photo-1.jpg`, etc.
5. Download `photos-index.json`
6. Verify URLs include SAS tokens:

```json
{
  "id": "1",
  "imageUrl": "https://ckcopilot.blob.core.windows.net/photo/photo-1.jpg?sp=racwdli&st=...&sig=...",
  "title": "Test Photo"
}
```

---

## Token Rotation Process

When SAS tokens expire (October 17, 2025), follow these steps:

### Step 1: Generate New Token
```
Azure Portal → Storage Account → Container → Shared access tokens
→ Set permissions: racwdli
→ Set new expiry date
→ Generate SAS token and URL
```

### Step 2: Update .env
```env
AZURE_PHOTO_STORAGE_URL=https://ckcopilot.blob.core.windows.net/photo?sp=racwdli&st=NEW_START&se=NEW_EXPIRY&sig=NEW_SIGNATURE
```

### Step 3: Restart Server
```bash
# Stop server (Ctrl+C)
pnpm dev
```

### Step 4: Automatic Refresh
The application will:
- ✅ Load photos from Azure
- ✅ Extract blob names from old URLs
- ✅ Reconstruct URLs with new SAS token from .env
- ✅ All photos accessible with new token

**No manual database updates needed!** 🎉

---

## Files Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/lib/server/azure-storage.ts` | Return full URL with SAS | Fix upload URL generation |
| `src/lib/server/azure-storage.ts` | Add `getPhotoBlobUrl()` | Helper for URL construction |
| `src/lib/server/db.ts` | Add token refresh logic | Update URLs on cache init |
| `src/lib/server/db.ts` | Import `getPhotoBlobUrl` | Use helper function |

---

## Related Documentation

- **SAS_TOKEN_MANAGEMENT.md** - Complete guide to token management
- **AZURE_INTEGRATION.md** - How Azure storage works
- **TROUBLESHOOTING.md** - Common issues and solutions
- **QUICK_REFERENCE.md** - Quick commands and tips

---

## Key Takeaways

### What Was Wrong
- URLs stored without SAS tokens
- Browser couldn't authenticate to Azure
- Photos appeared as broken images

### What Was Fixed
- URLs now include SAS tokens
- Automatic token refresh on load
- Token rotation supported

### What You Need to Do
1. ✅ Nothing! Fix is already applied
2. ⚠️ Set reminder for token expiry: **October 17, 2025**
3. 📖 Read SAS_TOKEN_MANAGEMENT.md for rotation guide

---

## Summary

**Problem**: Photos not loading (403 Forbidden)  
**Cause**: URLs missing SAS tokens for authentication  
**Solution**: Include SAS tokens in URLs + auto-refresh on load  
**Status**: ✅ **FIXED**  

**Your photos now load correctly with proper authentication!** 🎉

---

**Date**: 2025  
**Version**: 1.0.1  
**Status**: ✅ Resolved