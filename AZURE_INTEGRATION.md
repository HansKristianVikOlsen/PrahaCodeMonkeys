# 🔷 Azure Blob Storage Integration

This document explains how the Photo Sharing Application integrates with Azure Blob Storage for persistent data storage.

## Overview

The application uses Azure Blob Storage to store:
- **Photos**: Uploaded images stored as blobs in the `photo` container
- **Comments & Metadata**: Photo metadata and comments stored as JSON in the `comment` and `photo` containers

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SvelteKit Application                     │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              API Routes (+server.ts)                    │ │
│  └────────────────┬───────────────────────────────────────┘ │
│                   ↓                                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Database Logic (db.ts)                     │ │
│  │  - In-memory cache for performance                     │ │
│  │  - Async operations to Azure                           │ │
│  └────────────────┬───────────────────────────────────────┘ │
│                   ↓                                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Azure Storage Utilities (azure-storage.ts)     │ │
│  │  - Upload blobs                                        │ │
│  │  - Download blobs                                      │ │
│  │  - List blobs                                          │ │
│  │  - Delete blobs                                        │ │
│  └────────────────┬───────────────────────────────────────┘ │
└────────────────────┼───────────────────────────────────────┘
                     ↓ HTTPS with SAS Token
┌─────────────────────────────────────────────────────────────┐
│                  Azure Blob Storage                          │
│                                                              │
│  ┌───────────────────────┐  ┌───────────────────────────┐  │
│  │   photo container     │  │   comment container       │  │
│  │                       │  │                           │  │
│  │  photo-1.jpg         │  │  comments-index.json      │  │
│  │  photo-2.png         │  │                           │  │
│  │  photo-3.webp        │  │                           │  │
│  │  photos-index.json   │  │                           │  │
│  └───────────────────────┘  └───────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

### Photo Container (`photo`)

```
photo/
├── photo-1.jpg              # Uploaded image blob
├── photo-2.png              # Uploaded image blob
├── photo-3.webp             # Uploaded image blob
└── photos-index.json        # Metadata for all photos
```

### Comment Container (`comment`)

```
comment/
└── comments-index.json      # All comments for all photos
```

## Data Flow

### 1. Uploading a Photo

```
User uploads image
    ↓
UploadForm converts to File
    ↓
API receives FormData
    ↓
Convert to base64 data URL
    ↓
createPhoto() in db.ts
    ↓
Extract binary data from data URL
    ↓
Upload to Azure as blob (photo-{id}.{ext})
    ↓
Get public URL for the blob
    ↓
Add photo metadata to cache
    ↓
Save photos-index.json to Azure
    ↓
Return photo object with Azure URL
    ↓
Display in UI
```

### 2. Loading Photos

```
Page load or infinite scroll trigger
    ↓
API call to /api/photos
    ↓
getPhotos() in db.ts
    ↓
Check if cache initialized
    ↓
If not: Download photos-index.json from Azure
    ↓
Parse JSON and populate cache
    ↓
Return paginated photos from cache
    ↓
Display in UI
```

### 3. Adding Comments

```
User submits comment
    ↓
API call to /api/comments
    ↓
addComment() in db.ts
    ↓
Add comment to photo in cache
    ↓
Extract all comments from all photos
    ↓
Save comments-index.json to Azure
    ↓
Also update photos-index.json
    ↓
Return comment object
    ↓
Display in UI
```

## Implementation Details

### azure-storage.ts

**Key Functions**:

1. `uploadBlob(containerUrl, blobName, content, contentType)`
   - Uploads content to Azure Blob Storage
   - Uses PUT request with SAS token
   - Sets blob type to BlockBlob
   - Returns public URL of blob

2. `uploadPhoto(photoId, imageData, contentType)`
   - Wrapper for uploading photo images
   - Generates blob name: `photo-{id}.{extension}`
   - Handles image binary data

3. `getBlob(containerUrl, blobName)`
   - Downloads blob content
   - Returns as string (for JSON) or binary

4. `listBlobs(containerUrl)`
   - Lists all blobs in container
   - Parses XML response
   - Returns array of blob names

5. `deleteBlob(containerUrl, blobName)`
   - Deletes a blob from container
   - Uses DELETE request

6. `savePhotosIndex(photos)` / `getPhotosIndex()`
   - Saves/loads photos-index.json
   - Stores all photo metadata

7. `saveCommentsIndex(comments)` / `getCommentsIndex()`
   - Saves/loads comments-index.json
   - Stores all comments

### db.ts

**Caching Strategy**:

```typescript
let photosCache: Photo[] = [];  // In-memory cache
let cacheInitialized = false;   // Track initialization
```

**Key Changes from In-Memory to Azure**:

1. **Initialization**:
   ```typescript
   async function initializeCache() {
     if (cacheInitialized) return;
     photosCache = await getPhotosIndex();
     cacheInitialized = true;
   }
   ```

2. **All Operations are Async**:
   - `getPhotos()` → `async getPhotos()`
   - `createPhoto()` → `async createPhoto()`
   - `updatePhoto()` → `async updatePhoto()`
   - etc.

3. **Sync After Mutations**:
   ```typescript
   async function syncToAzure() {
     await savePhotosIndex(photosCache);
     const allComments = photosCache.flatMap(p => p.comments);
     await saveCommentsIndex(allComments);
   }
   ```

### API Routes

**Updated to Handle Async**:

```typescript
// Before (synchronous)
const photos = getPhotos(offset, limit);

// After (async with Azure)
const photos = await getPhotos(offset, limit);
```

All API routes now:
- Use `await` for database operations
- Have try-catch error handling
- Return 500 errors on Azure failures

## Environment Configuration

### Required Environment Variables

```env
AZURE_PHOTO_STORAGE_URL=https://{account}.blob.core.windows.net/photo?{sas-token}
AZURE_COMMENT_STORAGE_URL=https://{account}.blob.core.windows.net/comment?{sas-token}
AZURE_STORAGE_ACCOUNT={account-name}
AZURE_PHOTO_CONTAINER=photo
AZURE_COMMENT_CONTAINER=comment
```

### SAS Token Format

```
?sp=racwdli&st=2025-10-17T08:06:52Z&se=2025-10-17T16:21:52Z&spr=https&sv=2024-11-04&sr=c&sig=...
```

**Parameters**:
- `sp`: Permissions (racwdli)
- `st`: Start time
- `se`: Expiry time
- `spr`: Protocol (https only)
- `sv`: Service version
- `sr`: Resource type (c = container)
- `sig`: Cryptographic signature

## Performance Optimizations

### 1. In-Memory Caching

- Photos loaded from Azure once per session
- Subsequent reads from memory
- Writes immediately update cache
- Background sync to Azure

**Benefits**:
- Fast read operations
- Reduced Azure API calls
- Lower costs
- Better user experience

### 2. Background Sync

```typescript
// Sync to Azure in background, don't wait
syncToAzure().catch(err => console.error('Background sync failed:', err));
```

- Writes update cache immediately
- Azure sync happens in background
- UI doesn't wait for Azure confirmation

**Trade-offs**:
- Better UI responsiveness
- Small risk of data loss if server crashes before sync
- Consider using await for critical operations

### 3. Batch Operations

Photos and comments saved as index files:
- Single read/write for all data
- No individual blob per photo metadata
- Reduces API calls and costs

## Error Handling

### Connection Errors

```typescript
try {
  await uploadPhoto(photoId, buffer, contentType);
} catch (error) {
  console.error('Failed to upload to Azure:', error);
  // Fallback to data URL
  imageUrl = imageDataUrl;
}
```

### Token Expiration

- SAS tokens have expiration date
- Application will fail when token expires
- Must regenerate and update .env
- Consider implementing automatic rotation

### Network Failures

- Retries not implemented (could be added)
- Failed syncs logged to console
- Cache remains in memory until server restart

## Security Considerations

### 1. SAS Token Protection

✅ **Good Practices**:
- Tokens stored in `.env` (server-side only)
- Never exposed to client
- In `.gitignore` to prevent commits
- Separate tokens per environment

❌ **Avoid**:
- Hardcoding tokens in code
- Committing tokens to Git
- Using account keys instead of SAS
- Sharing tokens publicly

### 2. Token Permissions

**Minimum Required**:
- `r` (read) - View photos
- `w` (write) - Update metadata
- `c` (create) - Upload new photos
- `d` (delete) - Remove photos
- `l` (list) - List all photos

**Optional**:
- `a` (add) - Append to blobs
- `i` (immutable) - Write-once blobs

### 3. Public Access

- Containers set to **Private**
- Access only via SAS token
- Consider making photo blobs public for direct access
- Keep metadata JSON files private

## Monitoring & Debugging

### Enable Logging

```typescript
// In azure-storage.ts
console.log('Uploading to:', blobUrl);
console.log('Response status:', response.status);
```

### Check Azure Portal

1. Navigate to Storage Account
2. Go to **Monitoring** → **Insights**
3. View:
   - Request metrics
   - Error rates
   - Latency
   - Storage usage

### Common Debug Points

1. **SAS Token Validation**:
   ```bash
   # Test SAS URL in browser
   https://account.blob.core.windows.net/photo?sp=...&sig=...
   # Should return XML blob list
   ```

2. **Check Container Contents**:
   - Use Azure Storage Explorer
   - Or Azure Portal → Container → Blobs

3. **Verify Index Files**:
   ```bash
   # Download photos-index.json
   curl "https://account.blob.core.windows.net/photo/photos-index.json?{sas}"
   ```

## Migration from In-Memory

### Before (In-Memory)

```typescript
export const photos: Photo[] = [...];

export function getPhotos(offset, limit) {
  return photos.slice(offset, offset + limit);
}
```

### After (Azure)

```typescript
let photosCache: Photo[] = [];

export async function getPhotos(offset, limit) {
  await initializeCache();
  return photosCache.slice(offset, offset + limit);
}
```

### Migration Checklist

- [x] Create Azure Storage account
- [x] Create photo and comment containers
- [x] Generate SAS tokens
- [x] Create azure-storage.ts utility
- [x] Update db.ts to use Azure
- [x] Make all operations async
- [x] Update API routes to await
- [x] Add error handling
- [x] Test upload/download
- [x] Test comments
- [x] Update documentation

## Cost Optimization

### Reduce API Calls

1. **Use Caching** (Already implemented)
   - Load once, read many times from memory
   - Write batches instead of individual items

2. **Combine Requests**
   - Store metadata in index files
   - One read gets all photos
   - One write updates all metadata

3. **Lazy Loading**
   - Only load when needed
   - Use pagination
   - Don't load all blobs upfront

### Storage Tiers

- **Hot**: Frequently accessed (photos)
- **Cool**: Infrequently accessed (old photos)
- **Archive**: Rarely accessed (backups)

Consider moving old photos to Cool tier:
- Lower storage cost
- Higher access cost
- Good for photos > 30 days old

## Future Enhancements

### 1. Azure SDK Integration

Install official SDK:
```bash
pnpm add @azure/storage-blob
```

Benefits:
- Better error handling
- Upload progress tracking
- Automatic retries
- Streaming uploads

### 2. CDN Integration

Use Azure CDN:
- Faster image delivery
- Reduced latency
- Lower bandwidth costs
- Automatic caching

### 3. Image Processing

Azure Functions for:
- Thumbnail generation
- Image compression
- Format conversion
- Watermarking

### 4. Backup Strategy

Implement:
- Geo-redundant storage (GRS)
- Automated backups
- Point-in-time restore
- Version control for blobs

## Troubleshooting

### Issue: 403 Forbidden

**Cause**: Invalid or expired SAS token

**Fix**:
1. Check token expiration in `.env`
2. Regenerate SAS token in Azure Portal
3. Update `.env` file
4. Restart application

### Issue: 404 Not Found

**Cause**: Blob or container doesn't exist

**Fix**:
1. Verify container names (photo, comment)
2. Check containers exist in Azure Portal
3. Ensure photos-index.json exists
4. Upload initial empty index: `[]`

### Issue: CORS Error

**Cause**: Cross-origin request blocked

**Fix**:
1. Should not occur (server-side requests)
2. If client-side, configure CORS in Azure:
   - Go to Storage Account → CORS
   - Add allowed origins
   - Add allowed methods: GET, PUT, DELETE

### Issue: Slow Uploads

**Cause**: Large images, slow network

**Fix**:
1. Compress images before upload
2. Use image optimization library
3. Show progress indicator to users
4. Consider chunked uploads for large files

## Resources

- [Azure Blob Storage Docs](https://docs.microsoft.com/en-us/azure/storage/blobs/)
- [SAS Token Best Practices](https://docs.microsoft.com/en-us/azure/storage/common/storage-sas-overview)
- [Azure Storage REST API](https://docs.microsoft.com/en-us/rest/api/storageservices/)
- [AZURE_SETUP.md](./AZURE_SETUP.md) - Setup guide
- [README.md](./README.md) - Application documentation

---

**Summary**: The application successfully integrates with Azure Blob Storage for persistent, scalable storage of photos and comments using SAS tokens for secure access.