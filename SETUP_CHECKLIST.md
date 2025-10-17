# Setup Checklist - Azure AD Authentication

Complete these steps to get your Photo Gallery app running with Azure AD authentication.

## 📋 Pre-Setup

- [ ] Azure account with active subscription
- [ ] Access to Azure Active Directory (Entra ID)
- [ ] Node.js v20.19, v22.12, or v24+ installed
- [ ] Git repository cloned
- [ ] Terminal/command line access

---

## 🔐 Part 1: Azure AD Configuration (15 minutes)

### Step 1: Create App Registration

- [ ] Go to [Azure Portal](https://portal.azure.com)
- [ ] Navigate to **Azure Active Directory** (or **Microsoft Entra ID**)
- [ ] Click **App registrations** in left menu
- [ ] Click **+ New registration**
- [ ] Enter application name: `Photo Gallery App` (or your preferred name)
- [ ] Select account type: **Accounts in this organizational directory only**
- [ ] Click **Register**

**✏️ Note down**: Leave this tab open, you'll need it!

### Step 2: Configure Authentication

- [ ] In your app registration, click **Authentication** in left menu
- [ ] Click **+ Add a platform**
- [ ] Select **Web**
- [ ] Enter redirect URI: `http://localhost:5173/auth/callback`
- [ ] Click **Configure**
- [ ] Click **Save** at the top

### Step 3: Copy App Credentials

From the **Overview** page, copy these values:

- [ ] **Application (client) ID**: `________________________________`
- [ ] **Directory (tenant) ID**: `________________________________`

**💡 Tip**: Keep these in a secure note temporarily

### Step 4: Create Client Secret

- [ ] Click **Certificates & secrets** in left menu
- [ ] Under **Client secrets**, click **+ New client secret**
- [ ] Description: `Development Secret`
- [ ] Expires in: **6 months** (or your preference)
- [ ] Click **Add**
- [ ] **⚠️ IMMEDIATELY COPY THE SECRET VALUE**: `________________________________`
- [ ] ⚠️ You cannot view this again! Store it securely now!

### Step 5: Verify API Permissions

- [ ] Click **API permissions** in left menu
- [ ] Verify **Microsoft Graph > User.Read** is listed
- [ ] If not present, click **+ Add a permission** → **Microsoft Graph** → **Delegated permissions** → Search for **User.Read** → **Add permissions**
- [ ] If your organization requires it, click **Grant admin consent**

**✅ Azure AD Configuration Complete!**

---

## 📦 Part 2: Project Setup (5 minutes)

### Step 1: Install Dependencies

```bash
cd PrahaCodeMonkeys
pnpm install
```

- [ ] Dependencies installed successfully
- [ ] No error messages

### Step 2: Create Environment File

```bash
cp .env.example.auth .env
```

- [ ] `.env` file created in project root

### Step 3: Configure Environment Variables

Edit `.env` file and add your Azure AD credentials:

```env
# Azure AD Authentication
AZURE_AD_CLIENT_ID=paste-your-client-id-here
AZURE_AD_CLIENT_SECRET=paste-your-secret-value-here
AZURE_AD_TENANT_ID=paste-your-tenant-id-here
AZURE_AD_REDIRECT_URI=http://localhost:5173/auth/callback
```

**Checklist**:
- [ ] `AZURE_AD_CLIENT_ID` - Pasted from Azure Portal Overview
- [ ] `AZURE_AD_CLIENT_SECRET` - Pasted from secret you just created
- [ ] `AZURE_AD_TENANT_ID` - Pasted from Azure Portal Overview
- [ ] `AZURE_AD_REDIRECT_URI` - Set to `http://localhost:5173/auth/callback`
- [ ] No extra spaces before or after values
- [ ] No quotes around values
- [ ] Saved the file

### Step 4: Add Azure Storage Configuration (If Applicable)

If you have Azure Blob Storage set up:

```env
# Azure Blob Storage
AZURE_PHOTO_STORAGE_URL=your-photo-storage-url-with-sas-token
AZURE_COMMENT_STORAGE_URL=your-comment-storage-url-with-sas-token
```

- [ ] Azure Storage URLs added (or skipped if not using Azure Storage yet)

**✅ Project Setup Complete!**

---

## 🚀 Part 3: Testing (10 minutes)

### Step 1: Start Development Server

```bash
pnpm dev
```

- [ ] Server started without errors
- [ ] Shows: "Local: http://localhost:5173"

### Step 2: Test Login Flow

- [ ] Open browser to http://localhost:5173
- [ ] Automatically redirected to `/auth/login`
- [ ] See "Photo Gallery" login page
- [ ] See "Sign in with Microsoft" button
- [ ] Click "Sign in with Microsoft"
- [ ] Redirected to Microsoft login page
- [ ] Enter your Microsoft/Azure AD credentials
- [ ] Grant permissions if prompted
- [ ] Redirected back to http://localhost:5173
- [ ] See photo gallery main page
- [ ] See your username in top-right corner

### Step 3: Verify User Menu

- [ ] Click your username in top-right
- [ ] See dropdown menu with:
  - Your name
  - Your email
  - "Sign out" button
- [ ] Close dropdown by clicking outside

### Step 4: Test Photo Upload

- [ ] Click "➕ Upload New Photo" button
- [ ] Upload form appears
- [ ] Fill in title (required)
- [ ] Fill in description (optional)
- [ ] Choose an image file
- [ ] See image preview
- [ ] Click "Upload Photo"
- [ ] Photo appears in the gallery
- [ ] Your name appears as the owner

### Step 5: Test Comments

- [ ] Click on any photo to open modal
- [ ] Scroll to comments section
- [ ] Type a comment
- [ ] Click "Post Comment"
- [ ] Comment appears with your username
- [ ] Close modal

### Step 6: Test Logout

- [ ] Click your username in top-right
- [ ] Click "Sign out"
- [ ] Redirected to login page
- [ ] Try to access http://localhost:5173 directly
- [ ] Should redirect to login again
- [ ] Log back in successfully

**✅ Testing Complete!**

---

## ✅ Final Verification

### Security Checklist

- [ ] `.env` file is in `.gitignore` (should already be there)
- [ ] Haven't committed `.env` to Git
- [ ] Client secret stored securely
- [ ] No credentials in source code

### Functionality Checklist

- [ ] Login works
- [ ] User info displays
- [ ] Can upload photos
- [ ] Can add comments
- [ ] Can edit own photos
- [ ] Can delete own photos
- [ ] Cannot edit others' photos
- [ ] Cannot delete others' photos
- [ ] Logout works
- [ ] Session persists across refreshes

### Documentation Review

- [ ] Read [AUTH_QUICKSTART.md](./AUTH_QUICKSTART.md) - Quick start guide
- [ ] Reviewed [AZURE_AD_SETUP.md](./AZURE_AD_SETUP.md) - Detailed setup
- [ ] Reviewed [AUTHENTICATION.md](./AUTHENTICATION.md) - How it works
- [ ] Reviewed [README.md](./README.md) - Main documentation

---

## 🔧 Troubleshooting

If something isn't working, check these common issues:

### Issue: "Redirect URI mismatch"

**Solution**:
1. Go to Azure Portal → Your App → Authentication
2. Verify redirect URI is exactly: `http://localhost:5173/auth/callback`
3. No trailing slash
4. Save and wait 2-3 minutes for changes to propagate

### Issue: "AZURE_AD_CLIENT_ID is not set"

**Solution**:
1. Verify `.env` file exists in project root
2. Check variable names match exactly
3. Restart the dev server (Ctrl+C then `pnpm dev`)

### Issue: "Invalid client secret"

**Solution**:
1. Go to Azure Portal → Your App → Certificates & secrets
2. Create a new client secret
3. Copy the VALUE (not the ID)
4. Update `.env` with new secret
5. Restart dev server

### Issue: Blank page or errors

**Solution**:
1. Check browser console (F12) for errors
2. Check terminal for server errors
3. Clear browser cache and cookies
4. Try incognito/private browsing
5. Verify all environment variables are set correctly

### Still Having Issues?

1. **Quick Start**: See [AUTH_QUICKSTART.md](./AUTH_QUICKSTART.md)
2. **Detailed Guide**: See [AZURE_AD_SETUP.md](./AZURE_AD_SETUP.md)
3. **Troubleshooting**: See [AZURE_AD_SETUP.md#troubleshooting](./AZURE_AD_SETUP.md#troubleshooting)

---

## 🎉 Success!

If all checkboxes are marked, congratulations! Your Photo Gallery app is now running with Azure AD authentication.

### What You've Accomplished

✅ Set up Azure AD app registration  
✅ Configured OAuth 2.0 authentication  
✅ Implemented secure session management  
✅ Protected all routes and API endpoints  
✅ Tested the complete authentication flow  

### Next Steps

1. **Add More Features**
   - User profiles
   - Photo albums
   - Photo sharing
   - Advanced search

2. **Prepare for Production**
   - Create production Azure AD app
   - Set up Azure Key Vault
   - Configure production environment
   - Implement Redis for sessions

3. **Enhance Security**
   - Add rate limiting
   - Implement audit logging
   - Set up monitoring
   - Configure alerts

### Need Help?

- 📖 Review the documentation files
- 🔍 Check the troubleshooting sections
- 💬 Consult Microsoft Azure AD documentation
- 🐛 Check server logs and browser console

---

**Setup Date**: _______________  
**Completed By**: _______________  
**Status**: ✅ Ready for Development

Happy coding! 🚀