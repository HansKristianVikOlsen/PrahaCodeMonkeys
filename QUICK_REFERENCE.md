# 🚀 Quick Reference Guide

Essential commands and information for the Photo Sharing Application.

## 🏁 Getting Started

```bash
# 1. Install dependencies
pnpm install

# 2. Configure Azure (if not done)
cp .env.example .env
# Edit .env with your Azure SAS URLs

# 3. Test Azure connection
pnpm test:azure

# 4. Start development server
pnpm dev

# 5. Open browser
# http://localhost:5173
```

---

## 📋 Common Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm preview          # Preview production build

# Testing & Validation
pnpm test:azure       # Test Azure connection
pnpm check            # Type check
pnpm check:watch      # Type check (watch mode)

# Maintenance
pnpm install          # Install dependencies
pnpm update           # Update dependencies
```

---

## 🔷 Azure Configuration

### Required Environment Variables

```env
AZURE_PHOTO_STORAGE_URL=https://account.blob.core.windows.net/photo?sp=racwdli&...
AZURE_COMMENT_STORAGE_URL=https://account.blob.core.windows.net/comment?sp=racwdli&...
```

### SAS Token Permissions Required

- ✅ `r` - Read
- ✅ `a` - Add
- ✅ `c` - Create
- ✅ `w` - Write
- ✅ `d` - Delete
- ✅ `l` - List

### Token Expiration

⚠️ Your tokens expire: **October 17, 2025**

Set a reminder to regenerate!

---

## 🐛 Quick Troubleshooting

### 403 Forbidden Error
```bash
# Token expired or invalid
# Solution: Regenerate SAS token in Azure Portal
# Update .env file
# Restart app
```

### 404 Not Found
```bash
# Containers don't exist
# Solution: Create 'photo' and 'comment' containers in Azure
```

### Upload Not Working
```bash
# 1. Check file size < 10MB
# 2. Check file format (JPEG, PNG, GIF, WebP)
# 3. Check browser console for errors
# 4. Run: pnpm test:azure
```

### Photos Not Loading
```bash
# 1. Check photos-index.json exists in Azure
# 2. Restart dev server
# 3. Hard refresh browser (Ctrl+Shift+R)
```

---

## 📂 Project Structure

```
src/
├── lib/
│   ├── components/          # UI components
│   │   ├── PhotoCard.svelte
│   │   ├── PhotoModal.svelte
│   │   ├── UploadForm.svelte
│   │   └── UserSwitcher.svelte
│   ├── stores/              # State management
│   │   ├── photos.ts
│   │   └── user.ts
│   ├── server/              # Server-side logic
│   │   ├── db.ts           # Database with Azure
│   │   └── azure-storage.ts # Azure utilities
│   └── types/               # TypeScript types
│       └── index.ts
└── routes/
    ├── api/                 # API endpoints
    │   ├── photos/
    │   └── comments/
    └── +page.svelte         # Main page
```

---

## 🎯 Key Features

### Upload Photo
1. Click "Upload New Photo"
2. Enter title (required)
3. Add description (optional)
4. Select image file
5. Click "Upload Photo"

### View & Comment
1. Click any photo in grid
2. View full size in modal
3. Scroll to comments
4. Type and post comment

### Edit/Delete (Owner Only)
1. Click your photo
2. Click "Edit" or "Delete"
3. Make changes
4. Save or confirm deletion

### Switch Users (Demo)
- Click user avatar at top
- Test different permissions
- See owner vs non-owner views

---

## 🔗 API Endpoints

```
GET    /api/photos?offset=0&limit=10    # List photos
POST   /api/photos                       # Upload photo
GET    /api/photos/[id]                  # Get photo
PATCH  /api/photos/[id]                  # Update photo
DELETE /api/photos/[id]                  # Delete photo
POST   /api/comments                     # Add comment
DELETE /api/comments                     # Delete comment
```

---

## 💾 Data Storage

### Azure Containers

**Photo Container:**
- `photo-{id}.jpg` - Image blobs
- `photos-index.json` - Metadata

**Comment Container:**
- `comments-index.json` - All comments

### Local Cache
- Photos cached in memory for speed
- Auto-syncs to Azure on changes
- Reloads from Azure on restart

---

## 🎨 User Interface

### Demo Users
- 👩 **Alice** (User ID: 1) - Default
- 👨 **Bob** (User ID: 2)
- 🧑 **Charlie** (User ID: 3)

### Permissions
| Action | Owner | Non-Owner |
|--------|-------|-----------|
| View | ✅ | ✅ |
| Comment | ✅ | ✅ |
| Edit | ✅ | ❌ |
| Delete | ✅ | ❌ |

---

## 📱 Responsive Breakpoints

- **Mobile**: < 600px (1 column)
- **Tablet**: 600-900px (2-3 columns)
- **Desktop**: > 900px (3-4 columns)

---

## ⌨️ Keyboard Shortcuts

- `ESC` - Close modal
- `Tab` - Navigate elements
- `Enter` - Submit forms

---

## 🔍 Debug Mode

### Enable Logging
Add to any file:
```typescript
console.log('DEBUG:', variableName);
```

### Check State
In browser console:
```javascript
// View photos store
console.log($photosStore)

// View current user
console.log($user)
```

### Network Debugging
1. Open DevTools (F12)
2. Go to Network tab
3. Filter: "api"
4. Watch requests/responses

---

## 📊 Performance Tips

### Optimize Images
- Compress before upload
- Keep under 2MB
- Use WebP when possible
- Resize to 1920x1080 max

### Browser Performance
- Hard refresh: `Ctrl+Shift+R`
- Clear cache regularly
- Use Chrome/Edge for best performance

---

## 🔐 Security Notes

- SAS tokens in `.env` (server-side only)
- Never commit `.env` to Git
- Tokens expire Oct 17, 2025
- HTTPS-only connections
- Server-side Azure operations

---

## 💰 Cost Tracking

### Free Tier (First 12 months)
- 5 GB storage
- 20,000 read operations
- 2,000 write operations

### Estimated Cost (After Free Tier)
- 1000 photos (10 GB): ~$0.23/month
- Very affordable!

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| README.md | Main documentation |
| QUICKSTART.md | Quick start (5 min) |
| AZURE_SETUP.md | Azure configuration |
| AZURE_INTEGRATION.md | Technical details |
| TROUBLESHOOTING.md | Common issues |
| UPDATE_SUMMARY.md | Recent changes |
| QUICK_REFERENCE.md | This file |

---

## 🆘 Emergency Fixes

### App Won't Start
```bash
rm -rf node_modules .svelte-kit
pnpm install
pnpm dev
```

### Azure Connection Failed
```bash
# 1. Check .env file exists
cat .env

# 2. Test connection
pnpm test:azure

# 3. Regenerate tokens if expired
# See AZURE_SETUP.md
```

### TypeScript Errors
```bash
# Regenerate types
pnpm prepare

# Check for errors
pnpm check
```

---

## 📞 Getting Help

1. Check **TROUBLESHOOTING.md** first
2. Run `pnpm test:azure` for diagnostics
3. Review browser console (F12)
4. Check server terminal for errors
5. Consult relevant documentation

---

## ✅ Daily Checklist

- [ ] `.env` configured
- [ ] Azure containers exist
- [ ] SAS tokens not expired
- [ ] Dependencies installed
- [ ] Dev server running
- [ ] Browser on localhost:5173

---

## 🎯 Quick Tips

💡 **Upload fails?** Check file size < 10MB
💡 **Photos gone?** They're in Azure, just refresh
💡 **Modal won't open?** Check browser console
💡 **Slow loading?** Images might be too large
💡 **403 error?** Token expired, regenerate it

---

**Version**: 1.0.0
**Last Updated**: Azure Integration Complete
**Status**: ✅ Production Ready

---

For detailed information, see the full documentation in the respective files.