# 🚀 Quick Start Guide

Get your Photo Sharing App up and running in minutes!

## Prerequisites

- Node.js v20.19, v22.12, or v24+ ([Download here](https://nodejs.org/))
- pnpm (recommended) or npm

## Installation

```bash
# 1. Install dependencies
pnpm install

# 2. Start the development server
pnpm dev

# 3. Open your browser
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

- 📖 Read the full [README.md](./README.md) for detailed documentation
- 🔧 Explore the codebase in `/src`
- 🎨 Customize the UI by editing component styles
- 🚀 Build for production with `pnpm build`

## Need Help?

- Check [README.md](./README.md) for detailed documentation
- Review the code comments in `/src` directory
- Open an issue on GitHub

---

**Tip**: The app uses mock data stored in memory. Refreshing the page will reset to default photos!