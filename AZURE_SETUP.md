# 🔷 Azure Blob Storage Setup Guide

This guide will walk you through setting up Azure Blob Storage for the Photo Sharing Application.

## Prerequisites

- An Azure account ([Sign up for free](https://azure.microsoft.com/free/))
- Access to Azure Portal

## Step-by-Step Setup

### 1. Create a Storage Account

1. **Log in to Azure Portal**
   - Go to [portal.azure.com](https://portal.azure.com)
   - Sign in with your Azure account

2. **Create Storage Account**
   - Click **"Create a resource"**
   - Search for **"Storage account"**
   - Click **"Create"**

3. **Configure Storage Account**
   - **Subscription**: Select your subscription
   - **Resource Group**: Create new or select existing (e.g., `photo-app-rg`)
   - **Storage account name**: Enter a unique name (e.g., `ckcopilot`)
     - Must be 3-24 characters, lowercase letters and numbers only
   - **Region**: Choose closest to your users
   - **Performance**: Standard (recommended for this app)
   - **Redundancy**: LRS (Locally-redundant storage) for development
     - Use GRS (Geo-redundant) for production

4. **Review and Create**
   - Click **"Review + create"**
   - Click **"Create"**
   - Wait for deployment to complete

### 2. Create Blob Containers

1. **Navigate to Storage Account**
   - Go to your newly created storage account
   - Click on **"Containers"** in the left menu

2. **Create Photo Container**
   - Click **"+ Container"**
   - **Name**: `photo`
   - **Public access level**: Private (default)
   - Click **"Create"**

3. **Create Comment Container**
   - Click **"+ Container"** again
   - **Name**: `comment`
   - **Public access level**: Private (default)
   - Click **"Create"**

### 3. Generate SAS Tokens

#### For Photo Container

1. **Navigate to Photo Container**
   - Click on the `photo` container

2. **Generate SAS Token**
   - Click on **"Shared access tokens"** in the left menu
   - Or right-click the container and select **"Generate SAS"**

3. **Configure Permissions**
   - **Signing method**: Account key
   - **Signing key**: key1 (default)
   - **Permissions**: Check the following:
     - ☑️ Read
     - ☑️ Add
     - ☑️ Create
     - ☑️ Write
     - ☑️ Delete
     - ☑️ List
     - ☑️ Immutable storage (optional)
   
4. **Set Expiration**
   - **Start time**: Now (or your preferred start time)
   - **Expiry time**: Set to future date (e.g., 1 year from now)
   - **Time zone**: Your local timezone
   
5. **Generate Token**
   - Leave other settings as default
   - Click **"Generate SAS token and URL"**
   - **Copy the "Blob SAS URL"** - this is your `AZURE_PHOTO_STORAGE_URL`

#### For Comment Container

Repeat the same process for the `comment` container:
1. Navigate to the `comment` container
2. Generate SAS token with the same permissions
3. Copy the **"Blob SAS URL"** - this is your `AZURE_COMMENT_STORAGE_URL`

### 4. Configure Application

1. **Copy Environment Template**
   ```bash
   cp .env.example .env
   ```

2. **Update .env File**
   
   Open `.env` and paste your SAS URLs:
   ```env
   AZURE_PHOTO_STORAGE_URL=https://ckcopilot.blob.core.windows.net/photo?sp=racwdli&st=2025-10-17T08:06:52Z&se=2025-10-17T16:21:52Z&spr=https&sv=2024-11-04&sr=c&sig=YourActualSignatureHere
   
   AZURE_COMMENT_STORAGE_URL=https://ckcopilot.blob.core.windows.net/comment?sp=racwdli&st=2025-10-17T08:06:03Z&se=2025-10-17T16:21:03Z&spr=https&sv=2024-11-04&sr=c&sig=YourActualSignatureHere
   
   AZURE_STORAGE_ACCOUNT=ckcopilot
   AZURE_PHOTO_CONTAINER=photo
   AZURE_COMMENT_CONTAINER=comment
   ```

3. **Verify Configuration**
   ```bash
   # Check that .env file exists and has the correct values
   cat .env
   ```

### 5. Test the Setup

1. **Start the Application**
   ```bash
   pnpm dev
   ```

2. **Upload a Test Photo**
   - Open `http://localhost:5173`
   - Click "Upload New Photo"
   - Upload an image with title
   - Check if it appears in the gallery

3. **Verify in Azure Portal**
   - Go back to Azure Portal
   - Navigate to your `photo` container
   - You should see:
     - `photo-1.jpg` (or similar) - the uploaded image
     - `photos-index.json` - metadata file
   - Navigate to your `comment` container
   - You should see:
     - `comments-index.json` - comments metadata file

## SAS Token Details

### What is a SAS Token?

A **Shared Access Signature (SAS)** provides secure delegated access to resources in your storage account without sharing your account keys.

### SAS URL Structure

```
https://{account}.blob.core.windows.net/{container}?{parameters}
```

**Parameters**:
- `sp` - Permissions (racwdli = read, add, create, write, delete, list, immutable)
- `st` - Start time (ISO 8601 format)
- `se` - Expiry time (ISO 8601 format)
- `spr` - Protocol (https)
- `sv` - Service version
- `sr` - Resource (c = container)
- `sig` - Signature (cryptographic signature)

### Required Permissions

| Permission | Code | Description | Required For |
|------------|------|-------------|--------------|
| Read | r | Read blob content | Viewing photos |
| Add | a | Add block to blob | Uploading photos |
| Create | c | Create new blob | Uploading photos |
| Write | w | Write to blob | Updating metadata |
| Delete | d | Delete blob | Deleting photos |
| List | l | List blobs in container | Loading photo list |

## Security Best Practices

### 1. Token Expiration

- ✅ Set reasonable expiration dates (30-90 days)
- ✅ Rotate tokens before they expire
- ✅ Never use tokens that don't expire
- ✅ Store expiration date in your calendar

### 2. Permission Scope

- ✅ Grant only necessary permissions
- ✅ Use container-level SAS (not account-level)
- ✅ Separate tokens for different containers
- ❌ Don't use account keys in client-side code

### 3. Environment Variables

- ✅ Store SAS URLs in `.env` file
- ✅ Add `.env` to `.gitignore`
- ✅ Never commit tokens to version control
- ✅ Use different tokens for dev/staging/prod

### 4. HTTPS Only

- ✅ Always use `spr=https` in SAS tokens
- ✅ Ensure your app only makes HTTPS requests
- ❌ Never allow HTTP access to storage

## Token Management

### Rotating SAS Tokens

1. **Generate New Token**
   - Follow steps in "Generate SAS Tokens" section
   - Create new token with new expiration date

2. **Update Application**
   - Update `.env` file with new SAS URL
   - Restart application

3. **Grace Period**
   - Generate new token before old one expires
   - Update during low-traffic period
   - Keep old token valid during transition

### Monitoring Token Expiration

Create a reminder system:
```bash
# Add to your calendar or monitoring system
# Token expires: 2025-10-17T16:21:52Z
```

## Troubleshooting

### Common Issues

#### 1. Authentication Failed (403 Forbidden)

**Cause**: Invalid or expired SAS token

**Solution**:
- Check token expiration date in `.env`
- Verify permissions include `racwdli`
- Regenerate SAS token if expired
- Ensure no extra spaces in `.env` values

#### 2. Blob Not Found (404)

**Cause**: Container doesn't exist or wrong container name

**Solution**:
- Verify container names are `photo` and `comment`
- Check containers exist in Azure Portal
- Ensure container names match in SAS URLs

#### 3. Network Error

**Cause**: CORS, network, or connectivity issues

**Solution**:
- Check internet connection
- Verify Azure Storage account is not blocked
- Check if Storage Account has CORS enabled (usually not needed for SAS)
- Verify firewall settings in Azure

#### 4. Upload Failed (500 Error)

**Cause**: Missing permissions or invalid data

**Solution**:
- Check SAS token has `write`, `create`, and `add` permissions
- Verify file size is within limits (10MB)
- Check browser console for detailed error
- Verify content type is supported

### Debug Steps

1. **Check Environment Variables**
   ```bash
   # In your terminal
   echo $AZURE_PHOTO_STORAGE_URL
   ```

2. **Test SAS URL Directly**
   - Copy SAS URL from `.env`
   - Visit in browser (you should see XML blob list)
   - If error, regenerate SAS token

3. **Check Azure Portal**
   - Navigate to Storage Account
   - Check "Monitoring" → "Insights"
   - Review recent requests and errors

4. **Enable Logging**
   - In Azure Portal, enable diagnostic logs
   - Review logs for detailed error messages

## Cost Estimation

### Azure Blob Storage Pricing (Approximate)

**Free Tier** (First 12 months):
- 5 GB LRS blob storage
- 20,000 read operations
- 2,000 write operations

**After Free Tier** (LRS Hot tier):
- Storage: ~$0.018 per GB/month
- Operations:
  - Write: ~$0.05 per 10,000 transactions
  - Read: ~$0.004 per 10,000 transactions
  - List: ~$0.05 per 10,000 transactions

**Example Monthly Cost** (100 users, 1000 photos):
- Storage (10 GB): $0.18
- Operations (50k reads, 5k writes): $0.05
- **Total**: ~$0.23/month

*Prices may vary by region. Check [Azure Pricing Calculator](https://azure.microsoft.com/pricing/calculator/) for accurate estimates.*

## Alternative: Using Azure SDK

For production applications, consider using the official Azure SDK:

```bash
pnpm add @azure/storage-blob
```

Benefits:
- Better error handling
- Progress tracking for uploads
- Automatic retry logic
- Type-safe API

See [Azure Blob Storage SDK documentation](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-nodejs) for implementation details.

## Resources

- [Azure Blob Storage Documentation](https://docs.microsoft.com/en-us/azure/storage/blobs/)
- [SAS Token Best Practices](https://docs.microsoft.com/en-us/azure/storage/common/storage-sas-overview)
- [Azure Storage Explorer](https://azure.microsoft.com/features/storage-explorer/) - Desktop app for managing storage
- [Azure Pricing Calculator](https://azure.microsoft.com/pricing/calculator/)

## Next Steps

1. ✅ Configure CORS if needed for cross-origin requests
2. ✅ Set up Azure CDN for faster image delivery
3. ✅ Implement token rotation automation
4. ✅ Add monitoring and alerts for storage usage
5. ✅ Configure backup and disaster recovery

---

**Need Help?**

- Check the [main README](./README.md) for application setup
- Review [troubleshooting section](#troubleshooting) above
- Open an issue on GitHub
- Contact Azure Support if storage-related issues persist

Happy coding! 🚀