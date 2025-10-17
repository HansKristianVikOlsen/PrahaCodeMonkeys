# Azure AD Authentication - Quick Start Guide

Get your Photo Gallery app up and running with Azure AD authentication in 10 minutes!

## 🚀 Quick Setup (Development)

### Step 1: Azure AD App Registration (5 minutes)

1. **Go to Azure Portal**: https://portal.azure.com
2. **Navigate to**: Azure Active Directory > App registrations > New registration
3. **Fill in**:
   - Name: `Photo Gallery App`
   - Account type: `Accounts in this organizational directory only`
   - Redirect URI: `Web` → `http://localhost:5173/auth/callback`
4. **Click**: Register
5. **Copy these values** from the Overview page:
   - Application (client) ID
   - Directory (tenant) ID

### Step 2: Create Client Secret (2 minutes)

1. **Go to**: Certificates & secrets (left menu)
2. **Click**: + New client secret
3. **Add description**: `Dev Secret`
4. **Select expiration**: 6 months
5. **Click**: Add
6. **⚠️ COPY THE SECRET VALUE NOW** (you can't see it again!)

### Step 3: Configure Environment (1 minute)

Create `.env` file in project root:

```env
# Azure AD Authentication
AZURE_AD_CLIENT_ID=paste-your-client-id-here
AZURE_AD_CLIENT_SECRET=paste-your-secret-value-here
AZURE_AD_TENANT_ID=paste-your-tenant-id-here
AZURE_AD_REDIRECT_URI=http://localhost:5173/auth/callback

# Azure Blob Storage (if you have these)
AZURE_PHOTO_STORAGE_URL=your-photo-storage-url
AZURE_COMMENT_STORAGE_URL=your-comment-storage-url
```

### Step 4: Install & Run (2 minutes)

```bash
# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

### Step 5: Test Authentication

1. Open browser: http://localhost:5173
2. You'll see the login page
3. Click "Sign in with Microsoft"
4. Enter your Microsoft credentials
5. You should be redirected to the photo gallery!

## ✅ Verification Checklist

- [ ] Can see the login page
- [ ] Can click "Sign in with Microsoft"
- [ ] Redirected to Microsoft login
- [ ] Can enter credentials
- [ ] Redirected back to the app
- [ ] Can see your username in top-right corner
- [ ] Can click username to see logout option
- [ ] Can logout successfully

## 🔧 Troubleshooting

### "Redirect URI mismatch" error

**Fix**: Go to Azure Portal > Your App > Authentication
- Ensure redirect URI is exactly: `http://localhost:5173/auth/callback`
- No trailing slash!
- Save and wait 2-3 minutes

### "AZURE_AD_CLIENT_ID is not set" error

**Fix**: 
- Check `.env` file exists in project root
- Check variable names are exactly as shown above
- Restart dev server: Stop (Ctrl+C) and run `pnpm dev` again

### "Invalid client secret" error

**Fix**:
- Copy the secret VALUE, not the ID
- If you lost it, create a new secret in Azure Portal
- Update `.env` with new secret
- Restart dev server

### Can't see login page / blank screen

**Fix**:
- Check browser console for errors
- Verify all dependencies installed: `pnpm install`
- Clear browser cache
- Try incognito/private browsing

### Still stuck?

1. Check detailed guide: [AZURE_AD_SETUP.md](./AZURE_AD_SETUP.md)
2. Review authentication docs: [AUTHENTICATION.md](./AUTHENTICATION.md)
3. Check troubleshooting: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## 📝 What's Next?

After successful authentication:

### Upload a Photo
1. Click "➕ Upload New Photo"
2. Fill in title and description
3. Choose an image
4. Click "Upload Photo"

### Comment on Photos
1. Click any photo to open it
2. Scroll to comments section
3. Type your comment
4. Click "Post Comment"

### Manage Your Photos
- Edit your own photos (pencil icon)
- Delete your own photos (trash icon)
- Only you can edit/delete your photos!

## 🔐 Security Notes

✅ **Good Practices**:
- Never commit `.env` file
- Keep client secret secure
- Use different secrets for dev/prod
- Set secret expiration dates

❌ **Don't Do This**:
- Don't share your client secret
- Don't commit secrets to Git
- Don't use dev credentials in production
- Don't hardcode credentials

## 🚢 Production Deployment

When deploying to production:

1. **Create new App Registration** for production
2. **Add production redirect URI**: `https://your-domain.com/auth/callback`
3. **Use environment variables** in your hosting platform:
   - Vercel: Project Settings > Environment Variables
   - Azure App Service: Configuration > Application Settings
   - Heroku: Settings > Config Vars
4. **Use Azure Key Vault** for secrets management
5. **Enable HTTPS only**

## 📚 Additional Resources

- **Complete Setup Guide**: [AZURE_AD_SETUP.md](./AZURE_AD_SETUP.md)
- **Authentication Docs**: [AUTHENTICATION.md](./AUTHENTICATION.md)
- **Main README**: [README.md](./README.md)
- **Azure AD Docs**: https://docs.microsoft.com/azure/active-directory/develop/

## 🎉 Success!

If you've completed all steps and can log in, you're all set! 

Your app now has:
- ✅ Secure Azure AD authentication
- ✅ Session management
- ✅ Protected routes and APIs
- ✅ User identification for photos and comments

Happy coding! 🚀