# 🚀 Quick Start Guide

Get your Photo Sharing App up and running in minutes!

## Prerequisites

- Node.js v20.19, v22.12, or v24+ ([Download here](https://nodejs.org/))
- pnpm (recommended) or npm
- Azure Storage Account with SAS tokens (see [AZURE_SETUP.md](./AZURE_SETUP.md) for details)

## Installation

```bash
# 1. Configure Azure Blob Storage
cp .env.example .env
# Edit .env and add your Azure Storage SAS URLs

# 2. Install dependencies
pnpm install

# 3. Start the development server
pnpm dev

# 4. Open your browser
# Navigate to http://localhost:5173
```

## First Steps

### 1. Switch Users
At the top of the page, click on different user avatars to switch between:
- 👩 Alice
- 👨 Bob  
- 🧑 Charlie

### 2. Upload Your First Photo
1. Click **"➕ Upload New Photo"**
2. Enter a title (required)
3. Add a description (optional)
4. Choose an image file
5. Click **"Upload Photo"**

### 3. Explore Photos
- Scroll through the photo grid
- Infinite scrolling loads more photos automatically
- Click any photo to view it larger

### 4. Interact with Photos
In the photo modal:
- **As owner**: Edit, delete, and comment
- **As viewer**: Add comments only

### 5. Add Comments
1. Click on any photo
2. Scroll to the comment section
3. Type your comment
4. Click **"Post Comment"**

## Common Issues

### Missing Azure Configuration
```
Error: Cannot find module '$env/static/private'
```
**Solution**: Create and configure `.env` file
```bash
cp .env.example .env
# Edit .env with your Azure SAS URLs
```

### Azure Authentication Error (403)
```
Error: Failed to upload blob: 403
```
**Solution**: Check your SAS token has not expired and has correct permissions
- See [AZURE_SETUP.md](./AZURE_SETUP.md) for token generation
- Ensure permissions include: read, add, create, write, delete, list

### Node Version Error
```
Error: Unsupported environment
```
**Solution**: Use Node.js v20.19, v22.12, or v24+
```bash
# If using nvm:
nvm use 22.12.0
```

### Port Already in Use
```
Error: Port 5173 is already in use
```
**Solution**: Either kill the process using that port or use a different port:
```bash
pnpm dev -- --port 3000
```

## What's Next?

- 🔷 Set up Azure Blob Storage: [AZURE_SETUP.md](./AZURE_SETUP.md)
- 📖 Read the full [README.md](./README.md) for detailed documentation
- 🔧 Explore the codebase in `/src`
- 🎨 Customize the UI by editing component styles
- 🚀 Build for production with `pnpm build`

## Need Help?

- Check [README.md](./README.md) for detailed documentation
- Review the code comments in `/src` directory
- Open an issue on GitHub

---

**Tip**: The app now uses Azure Blob Storage for persistence! Your photos and comments are saved even after refresh. Make sure your `.env` file is properly configured.