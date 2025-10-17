# 🔧 Troubleshooting Guide

Common issues and solutions for the Photo Sharing Application.

## Table of Contents

- [Setup Issues](#setup-issues)
- [Azure Blob Storage Issues](#azure-blob-storage-issues)
- [Upload Issues](#upload-issues)
- [Runtime Errors](#runtime-errors)
- [Performance Issues](#performance-issues)
- [Development Issues](#development-issues)

---

## Setup Issues

### Issue: Node Version Error

```
Error: Unsupported environment (bad pnpm and/or Node.js version)
Your Node version is incompatible
Expected version: ^20.19 || ^22.12 || >=24
Got: v23.9.0
```

**Cause**: Incompatible Node.js version

**Solution**:
```bash
# Using nvm (recommended)
nvm install 22.12.0
nvm use 22.12.0

# Verify version
node --version
```

**Alternative**: Update the project to support Node 23:
- Edit `package.json` and update engine requirements
- May require updating dependencies

---

### Issue: Missing .env File

```
Error: Cannot find module '$env/static/private'
```

**Cause**: Environment variables not configured

**Solution**:
```bash
# 1. Copy the example file
cp .env.example .env

# 2. Edit .env and add your Azure SAS URLs
# Replace the placeholder URLs with your actual Azure SAS tokens

# 3. Verify the file exists
cat .env
```

**Required variables**:
- `AZURE_PHOTO_STORAGE_URL`
- `AZURE_COMMENT_STORAGE_URL`

---

### Issue: Dependencies Not Installed

```
Error: Cannot find module 'svelte'
```

**Cause**: npm/pnpm packages not installed

**Solution**:
```bash
# Clear any lock files (if having issues)
rm -rf node_modules pnpm-lock.yaml

# Install dependencies
pnpm install

# Or with npm
npm install
```

---

## Azure Blob Storage Issues

### Issue: 403 Forbidden Error

```
Error: Failed to upload blob: 403 - Forbidden
```

**Causes**:
1. SAS token expired
2. Invalid SAS token
3. Insufficient permissions
4. Incorrect container URL

**Solutions**:

**1. Check Token Expiration**:
```bash
# Look at the se (expiry) parameter in your SAS URL
# Example: se=2025-10-17T16:21:52Z means expires Oct 17, 2025
```

**2. Regenerate SAS Token**:
- Go to [Azure Portal](https://portal.azure.com)
- Navigate to your Storage Account
- Select the container (photo or comment)
- Click "Shared access tokens"
- Set permissions: `racwdli`
- Set new expiry date
- Generate and copy new SAS URL
- Update `.env` file
- Restart the app

**3. Verify Permissions**:
Your SAS token must include:
- ✅ Read (r)
- ✅ Add (a)
- ✅ Create (c)
- ✅ Write (w)
- ✅ Delete (d)
- ✅ List (l)

**4. Test Token Manually**:
```bash
# Copy your SAS URL and visit in browser
# Should show XML list of blobs
https://ckcopilot.blob.core.windows.net/photo?sp=racwdli&...
```

---

### Issue: 404 Not Found

```
Error: Blob not found
Error: Photo not found
```

**Causes**:
1. Container doesn't exist
2. Blob name incorrect
3. Wrong container URL

**Solutions**:

**1. Verify Containers Exist**:
- Go to Azure Portal
- Navigate to Storage Account
- Click "Containers"
- Ensure `photo` and `comment` containers exist
- Create them if missing

**2. Check Container Names**:
```env
# In .env file, verify URLs point to correct containers
AZURE_PHOTO_STORAGE_URL=https://account.blob.core.windows.net/photo?...
AZURE_COMMENT_STORAGE_URL=https://account.blob.core.windows.net/comment?...
```

**3. Initialize Index Files**:
```bash
# Run the test script to create initial files
pnpm test:azure
```

Or manually create empty index files:
- Upload `photos-index.json` with content: `[]`
- Upload `comments-index.json` with content: `[]`

---

### Issue: CORS Error

```
Error: CORS policy blocked the request
```

**Cause**: Cross-origin request configuration

**Solution**:

This should NOT happen since all Azure requests are server-side.

If it does occur:
1. Check if you're making client-side Azure calls (you shouldn't be)
2. Verify requests go through API routes
3. If needed, configure CORS in Azure:
   - Go to Storage Account → Settings → CORS
   - Add allowed origin: `http://localhost:5173`
   - Add methods: GET, PUT, DELETE, POST
   - Add headers: `*`

---

### Issue: Network Timeout

```
Error: Request timeout
Error: Network request failed
```

**Causes**:
1. Slow internet connection
2. Large file upload
3. Azure service issues

**Solutions**:

**1. Check Internet Connection**:
```bash
# Test connectivity to Azure
curl https://ckcopilot.blob.core.windows.net
```

**2. Reduce File Size**:
- Compress images before upload
- Implement client-side image optimization
- Set file size limits (currently 10MB)

**3. Check Azure Status**:
- Visit [Azure Status](https://status.azure.com)
- Check for service outages in your region

---

## Upload Issues

### Issue: FileReader is not defined

```
ReferenceError: FileReader is not defined
```

**Cause**: Using browser API on server

**Status**: ✅ FIXED in latest version

**Verification**:
Check `src/routes/api/photos/+server.ts` uses Node.js Buffer:
```typescript
const arrayBuffer = await file.arrayBuffer();
const buffer = Buffer.from(arrayBuffer);
```

---

### Issue: Upload Fails Silently

Photo doesn't appear after upload, no error shown.

**Debugging Steps**:

**1. Check Browser Console**:
- Open DevTools (F12)
- Look for JavaScript errors
- Check Network tab for failed requests

**2. Check Server Logs**:
```bash
# Look for error messages in terminal where `pnpm dev` is running
```

**3. Verify File Format**:
Supported formats:
- ✅ JPEG (.jpg, .jpeg)
- ✅ PNG (.png)
- ✅ GIF (.gif)
- ✅ WebP (.webp)
- ❌ Others (HEIC, TIFF, etc.)

**4. Check File Size**:
- Maximum: 10MB
- Files larger than 10MB will be rejected

**5. Verify Azure Connection**:
```bash
# Test Azure connection
pnpm test:azure
```

---

### Issue: Image Preview Not Showing

**Cause**: File reading issue or invalid file

**Solution**:

**1. Check File Selection**:
- Click the file input
- Select a valid image file
- Preview should appear immediately

**2. Try Different Image**:
- Use a small JPEG file (< 1MB)
- Verify it's a valid image
- Try opening it in another app first

**3. Check Browser Compatibility**:
- Update to latest browser version
- Try a different browser (Chrome, Firefox, Safari)

---

## Runtime Errors

### Issue: 500 Internal Server Error

```
[500] POST /api/photos
Error: Failed to create photo
```

**Debugging**:

**1. Check Server Logs**:
Look in terminal for detailed error:
```
Error: Failed to upload to Azure: [details]
```

**2. Enable Debug Logging**:
Add to `src/lib/server/azure-storage.ts`:
```typescript
console.log('Uploading to:', blobUrl);
console.log('Content type:', contentType);
```

**3. Common Causes**:
- Azure SAS token expired → Regenerate
- Network issue → Check connection
- Invalid data format → Verify image encoding
- Permissions issue → Check SAS permissions

---

### Issue: Photos Not Loading

Gallery is empty even though photos exist in Azure.

**Solutions**:

**1. Check Azure for Index File**:
- Go to Azure Portal
- Open `photo` container
- Look for `photos-index.json`
- Download and verify it contains data

**2. Clear Cache**:
```bash
# Restart the development server
# Press Ctrl+C in terminal
pnpm dev
```

**3. Rebuild Index**:
If index is corrupted, you may need to rebuild it:
- List all photo blobs in Azure
- Recreate `photos-index.json` manually
- Upload it to the container

---

### Issue: Comments Not Saving

**Debugging**:

**1. Check Network Tab**:
- Open DevTools → Network
- Click on a photo
- Add a comment
- Look for POST to `/api/comments`
- Check response status and body

**2. Verify Photo ID**:
- Ensure photo has valid ID
- Check `photoId` is being sent in request

**3. Test Manually**:
```bash
# Use curl to test API directly
curl -X POST http://localhost:5173/api/comments \
  -H "Content-Type: application/json" \
  -d '{"photoId":"1","content":"Test comment"}'
```

---

### Issue: Modal Not Opening

Click on photo but modal doesn't appear.

**Solutions**:

**1. Check Browser Console**:
- Look for JavaScript errors
- Check if photo object is valid

**2. Verify Photo Data**:
```javascript
// In browser console
console.log($photosStore)
```

**3. Clear Browser Cache**:
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Or clear cache in DevTools

---

## Performance Issues

### Issue: Slow Photo Loading

**Solutions**:

**1. Enable Image Optimization**:
- Compress images before upload
- Use WebP format when possible
- Generate thumbnails for grid view

**2. Optimize Azure Calls**:
Current implementation caches in memory - this is good!

If still slow:
- Check network speed to Azure
- Consider using Azure CDN
- Reduce batch size in pagination

**3. Browser Performance**:
- Close other tabs
- Disable browser extensions
- Use Chrome/Edge for best performance

---

### Issue: Slow Uploads

**Solutions**:

**1. Optimize Images**:
```bash
# Before upload, compress images
# Use tools like:
# - ImageOptim (Mac)
# - TinyPNG (Online)
# - Squoosh (Web app)
```

**2. Check Upload Size**:
- Large images (> 5MB) will be slow
- Recommend keeping under 2MB
- Resize to max 1920x1080 for web

**3. Network Issues**:
- Test internet speed
- Try different network
- Upload during off-peak hours

---

### Issue: High Memory Usage

App consuming too much RAM.

**Causes**:
- Large cache of photos
- Too many images in memory
- Memory leak in components

**Solutions**:

**1. Reduce Cache Size**:
Edit `src/lib/server/db.ts` to limit cache:
```typescript
// Keep only last 100 photos in cache
if (photosCache.length > 100) {
  photosCache = photosCache.slice(0, 100);
}
```

**2. Implement Pagination**:
Already implemented! But you can reduce batch size:
```typescript
const limit = 5; // Instead of 10
```

**3. Restart Server**:
```bash
# Stop server (Ctrl+C)
# Start again
pnpm dev
```

---

## Development Issues

### Issue: TypeScript Errors

```
Error: Type 'X' is not assignable to type 'Y'
```

**Solutions**:

**1. Run Type Check**:
```bash
pnpm check
```

**2. Regenerate Types**:
```bash
pnpm prepare
```

**3. Restart TypeScript Server**:
In VS Code:
- Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows)
- Type "TypeScript: Restart TS Server"
- Press Enter

---

### Issue: Hot Reload Not Working

Changes not appearing in browser.

**Solutions**:

**1. Hard Refresh Browser**:
- Ctrl+Shift+R (Windows/Linux)
- Cmd+Shift+R (Mac)

**2. Restart Dev Server**:
```bash
# Stop server (Ctrl+C)
pnpm dev
```

**3. Clear Vite Cache**:
```bash
rm -rf .svelte-kit
rm -rf node_modules/.vite
pnpm dev
```

---

### Issue: Build Fails

```
Error: Build failed
```

**Solutions**:

**1. Check TypeScript Errors**:
```bash
pnpm check
```

**2. Clean Build**:
```bash
rm -rf .svelte-kit build
pnpm build
```

**3. Update Dependencies**:
```bash
pnpm update
```

---

## Quick Diagnostic Checklist

When something goes wrong, check these in order:

- [ ] Is `.env` file configured with valid Azure SAS URLs?
- [ ] Are SAS tokens not expired? (Check `se` parameter)
- [ ] Do the `photo` and `comment` containers exist in Azure?
- [ ] Does `photos-index.json` exist in photo container?
- [ ] Run `pnpm test:azure` - does it pass?
- [ ] Check browser console for errors (F12)
- [ ] Check server terminal for errors
- [ ] Try hard refresh (Ctrl+Shift+R)
- [ ] Restart dev server
- [ ] Clear cache and rebuild

---

## Still Having Issues?

1. **Check Documentation**:
   - [README.md](./README.md) - Setup and usage
   - [AZURE_SETUP.md](./AZURE_SETUP.md) - Azure configuration
   - [AZURE_INTEGRATION.md](./AZURE_INTEGRATION.md) - Technical details
   - [QUICKSTART.md](./QUICKSTART.md) - Quick start guide

2. **Enable Debug Mode**:
   Add logging throughout the app:
   ```typescript
   console.log('DEBUG:', variableName);
   ```

3. **Test Components Individually**:
   - Test Azure connection: `pnpm test:azure`
   - Test file upload with small image
   - Test comment posting
   - Test each feature separately

4. **Check Azure Portal**:
   - Verify containers exist
   - Check blob contents
   - Review access logs
   - Monitor metrics

5. **Get Help**:
   - Open an issue on GitHub
   - Include error messages
   - Include steps to reproduce
   - Include browser and Node.js versions

---

## Common Error Messages Reference

| Error | Likely Cause | Quick Fix |
|-------|--------------|-----------|
| `403 Forbidden` | Expired/invalid SAS token | Regenerate SAS token |
| `404 Not Found` | Container/blob doesn't exist | Create container in Azure |
| `500 Server Error` | Server-side issue | Check server logs |
| `CORS Error` | Cross-origin issue | Should not happen - check implementation |
| `FileReader not defined` | Browser API on server | Use Node.js Buffer (already fixed) |
| `atob not defined` | Browser API on server | Use Node.js Buffer (already fixed) |
| `Module not found` | Missing dependency | Run `pnpm install` |
| `Type error` | TypeScript issue | Run `pnpm check` |

---

**Last Updated**: Check git log for latest updates

**Need more help?** Open an issue with:
- Error message (full text)
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node version, OS, browser)