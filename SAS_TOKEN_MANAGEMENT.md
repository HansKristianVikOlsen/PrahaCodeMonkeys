# 🔑 SAS Token Management Guide

This document explains how Shared Access Signature (SAS) tokens are managed in the Photo Sharing Application.

## Overview

The application uses Azure Blob Storage with SAS tokens for authentication. This guide covers how tokens are used, stored, and rotated.

---

## 🔐 How SAS Tokens Work

### What is a SAS Token?

A **Shared Access Signature (SAS)** is a URI that grants restricted access to Azure Storage resources without exposing your account key.

### SAS Token Structure

```
https://ckcopilot.blob.core.windows.net/photo?sp=racwdli&st=2025-10-17T08:06:52Z&se=2025-10-17T16:21:52Z&spr=https&sv=2024-11-04&sr=c&sig=YourSignatureHere
```

**Components**:
- **Base URL**: `https://ckcopilot.blob.core.windows.net/photo`
- **Query Parameters** (the SAS token):
  - `sp` - Permissions (racwdli)
  - `st` - Start time (when token becomes valid)
  - `se` - Expiry time (when token expires) ⚠️
  - `spr` - Protocol (https only)
  - `sv` - Service version
  - `sr` - Resource type (c = container)
  - `sig` - Cryptographic signature

---

## 📦 Token Storage in Application

### Environment Variables

SAS tokens are stored in `.env` file (server-side only):

```env
AZURE_PHOTO_STORAGE_URL=https://account.blob.core.windows.net/photo?sp=...&sig=...
AZURE_COMMENT_STORAGE_URL=https://account.blob.core.windows.net/comment?sp=...&sig=...
```

**Security**:
- ✅ Never committed to Git (in `.gitignore`)
- ✅ Only accessible on server-side
- ✅ Never exposed to client/browser
- ✅ Separate tokens per container

### Photo URLs in Database

Photo URLs are stored WITH SAS tokens in `photos-index.json`:

```json
{
  "id": "1",
  "imageUrl": "https://account.blob.core.windows.net/photo/photo-1.jpg?sp=racwdli&...&sig=...",
  "title": "My Photo"
}
```

**Why include token in stored URLs?**
- Images are accessed directly by the browser
- Browser needs authentication to view images
- URLs must be complete with SAS token

---

## 🔄 Token Refresh Strategy

### Problem: Token Expiration

When a SAS token expires:
- ❌ Stored photo URLs become invalid
- ❌ Images fail to load (403 Forbidden)
- ❌ New uploads fail

### Solution: Dynamic Token Refresh

The application automatically refreshes tokens when loading photos:

```typescript
// In db.ts - initializeCache()
photosCache = photosCache.map(photo => {
  // Extract blob name from old URL
  if (photo.imageUrl.includes('blob.core.windows.net/photo/')) {
    const blobName = photo.imageUrl.split('/photo/')[1].split('?')[0];
    // Reconstruct URL with current SAS token from .env
    photo.imageUrl = getPhotoBlobUrl(blobName);
  }
  return photo;
});
```

**How it works**:
1. Load photos from Azure
2. Extract blob name (e.g., `photo-1.jpg`)
3. Reconstruct URL with current SAS token from `.env`
4. Serve photos with fresh URLs

**Benefits**:
- ✅ Rotate tokens by just updating `.env`
- ✅ No need to update stored URLs manually
- ✅ Automatic token refresh on server restart
- ✅ Works seamlessly across token rotations

---

## 🔄 Token Rotation Process

### When to Rotate

Rotate SAS tokens:
- ⏰ Before expiration (set reminder!)
- 🔒 If token is compromised
- 📅 Regular schedule (30-90 days recommended)
- 🔐 When team members leave

**Your current token expires**: **October 17, 2025 at 16:21:52 UTC**

### Step-by-Step Rotation

#### 1. Generate New SAS Token

In Azure Portal:
```
Storage Account → Container → Shared access tokens
→ Set permissions (racwdli)
→ Set new expiry date
→ Generate SAS token and URL
```

#### 2. Update .env File

```bash
# Edit .env
AZURE_PHOTO_STORAGE_URL=https://...?sp=racwdli&...&sig=NEW_TOKEN_HERE
```

#### 3. Restart Application

```bash
# Stop server (Ctrl+C)
pnpm dev
```

#### 4. Verify

```bash
# Test connection with new token
pnpm test:azure
```

**That's it!** The application will automatically use new tokens for all operations.

---

## 🎯 Best Practices

### Token Security

✅ **DO**:
- Store tokens in `.env` (server-side only)
- Use HTTPS-only tokens (`spr=https`)
- Set reasonable expiration dates
- Use container-level SAS (not account-level)
- Grant minimum required permissions
- Rotate tokens regularly

❌ **DON'T**:
- Commit tokens to Git
- Share tokens publicly
- Use tokens without expiration
- Grant more permissions than needed
- Use account keys instead of SAS
- Store tokens in client-side code

### Token Permissions

**Required for this application**:
- `r` (read) - View photos
- `c` (create) - Upload new photos
- `w` (write) - Update metadata
- `d` (delete) - Remove photos
- `l` (list) - List all photos

**Optional**:
- `a` (add) - Append to blobs
- `i` (immutable) - Immutable storage

### Expiration Timing

**Recommended**:
- Development: 30-90 days
- Production: 30 days
- Never: No expiration (not recommended)

**Set reminders**:
```bash
# Add to calendar
# "Rotate Azure SAS tokens" - 1 week before expiration
```

---

## 🚨 Token Expiration Handling

### What Happens When Token Expires?

**Symptoms**:
- 403 Forbidden errors on photo uploads
- Images fail to load (broken image icons)
- New comments won't save
- API calls to Azure fail

**Error messages**:
```
Error: Failed to upload blob: 403 - Forbidden
Error: Server not authenticated
```

### Emergency Fix

```bash
# 1. Generate new token in Azure Portal (5 minutes)
# 2. Update .env file
# 3. Restart server
pnpm dev
# 4. Test
pnpm test:azure
```

### Prevention

Set up monitoring:
```bash
# Add to CI/CD or cron job
# Check if token expiry is within 7 days
# Send alert to team
```

---

## 🔍 Debugging Token Issues

### Check Token Expiration

```bash
# Look at your SAS URL
# Find the 'se' parameter (expiry time)
se=2025-10-17T16:21:52Z
# This means: Expires October 17, 2025 at 16:21:52 UTC
```

### Test Token Manually

```bash
# Copy full SAS URL from .env
# Paste in browser
https://ckcopilot.blob.core.windows.net/photo?sp=racwdli&...

# Should see: XML list of blobs
# If 403: Token expired or invalid
```

### Verify Token Permissions

Check your SAS URL includes:
```
sp=racwdli
```

If not, regenerate with correct permissions.

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| 403 Forbidden | Token expired | Regenerate token |
| 401 Unauthorized | Invalid signature | Generate new token |
| 400 Bad Request | Malformed URL | Check .env formatting |
| Token not found | .env missing | Create .env from template |

---

## 📊 Token Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│                    Token Lifecycle                       │
└─────────────────────────────────────────────────────────┘

1. GENERATE
   ↓
   Generate SAS token in Azure Portal
   Set permissions: racwdli
   Set expiry: +90 days
   ↓
2. STORE
   ↓
   Save to .env file
   Keep secure (not in Git)
   ↓
3. USE
   ↓
   Application reads from .env
   Constructs URLs with token
   Accesses Azure Storage
   ↓
4. MONITOR
   ↓
   Track expiration date
   Set reminder (7 days before)
   ↓
5. ROTATE
   ↓
   Generate new token
   Update .env
   Restart application
   ↓
   (Repeat from step 3)
```

---

## 🛠️ Implementation Details

### URL Construction

**Upload (server-side)**:
```typescript
// src/lib/server/azure-storage.ts
export async function uploadBlob(containerUrl, blobName, content) {
  // Construct full URL with SAS token
  const blobUrl = `${containerUrl.split('?')[0]}/${blobName}?${containerUrl.split('?')[1]}`;
  
  // Upload to Azure
  await fetch(blobUrl, { method: 'PUT', body: content });
  
  // Return full URL with token
  return { url: blobUrl, blobName };
}
```

**Refresh URLs (on load)**:
```typescript
// src/lib/server/db.ts
async function initializeCache() {
  photosCache = await getPhotosIndex();
  
  // Update URLs with current token
  photosCache = photosCache.map(photo => {
    const blobName = extractBlobName(photo.imageUrl);
    photo.imageUrl = getPhotoBlobUrl(blobName); // Uses current .env token
    return photo;
  });
}
```

### Helper Functions

```typescript
// Get blob URL with current SAS token
export function getPhotoBlobUrl(blobName: string): string {
  const baseUrl = AZURE_PHOTO_STORAGE_URL.split('?')[0];
  const sasToken = AZURE_PHOTO_STORAGE_URL.split('?')[1];
  return `${baseUrl}/${blobName}?${sasToken}`;
}
```

---

## 📝 Checklist for Token Management

### Initial Setup
- [x] Generate SAS tokens in Azure Portal
- [x] Create `.env` file
- [x] Add tokens to `.env`
- [x] Verify `.env` in `.gitignore`
- [x] Test with `pnpm test:azure`

### Regular Maintenance
- [ ] Set calendar reminder for token expiry
- [ ] Document current token expiry date
- [ ] Share rotation procedure with team
- [ ] Set up monitoring/alerts

### Before Token Expires
- [ ] Generate new SAS tokens (1 week before)
- [ ] Test new tokens in staging
- [ ] Update .env in production
- [ ] Restart application
- [ ] Verify all features work

### After Rotation
- [ ] Confirm old tokens still work (grace period)
- [ ] Monitor for 403 errors
- [ ] Update documentation with new expiry
- [ ] Set next reminder

---

## 🎓 FAQ

### Q: Why do photo URLs include SAS tokens?

**A**: Browsers need to access images directly. Since Azure storage is private, the URL must include authentication (SAS token).

### Q: Will old photos break when I rotate tokens?

**A**: No! The application automatically refreshes URLs with current tokens when loading photos from Azure.

### Q: Can I remove tokens from stored URLs?

**A**: Not recommended. Browsers would get 403 errors. Current approach allows token rotation without database updates.

### Q: What if someone steals my SAS token?

**A**: Generate a new token immediately. Since tokens are time-limited, stolen tokens will eventually expire. Use short expiration times for production.

### Q: Can I use account keys instead?

**A**: Not recommended. SAS tokens are more secure because:
- Time-limited expiration
- Scoped permissions
- Can be revoked individually
- No need to regenerate account keys

### Q: How do I know when my token expires?

**A**: Check the `se` parameter in your SAS URL, or run:
```bash
# Extract expiry from .env
grep AZURE_PHOTO_STORAGE_URL .env | grep -o "se=[^&]*"
```

---

## 📚 Related Documentation

- **AZURE_SETUP.md** - How to generate SAS tokens
- **AZURE_INTEGRATION.md** - Technical implementation
- **TROUBLESHOOTING.md** - Token-related issues
- **QUICK_REFERENCE.md** - Quick commands

---

## 🔗 External Resources

- [Azure SAS Documentation](https://docs.microsoft.com/en-us/azure/storage/common/storage-sas-overview)
- [SAS Best Practices](https://docs.microsoft.com/en-us/azure/storage/common/storage-sas-overview#best-practices)
- [Azure Portal](https://portal.azure.com)

---

**Last Updated**: Azure Integration Complete
**Token Expiry**: October 17, 2025 at 16:21:52 UTC ⚠️

**Remember**: Set a calendar reminder to rotate tokens before expiration!