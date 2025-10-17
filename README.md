# 📸 Photo Sharing Application

A modern photo sharing application built with SvelteKit 5, featuring infinite scrolling, CRUD operations, and real-time commenting.

## Features

- ✨ **Photo Upload**: Upload photos with title and description
- 🔄 **Infinite Scrolling**: Seamlessly load more photos as you scroll
- 👁️ **Photo Modal**: Click any photo to view it in full size with details
- ✏️ **Edit & Delete**: Photo owners can edit or delete their photos
- 💬 **Comments**: All users can comment on any photo
- 👥 **User Management**: Switch between demo users to test different permissions
- 📱 **Responsive Design**: Works great on desktop, tablet, and mobile

## Tech Stack

- **Framework**: SvelteKit 5 with Svelte 5 Runes
- **Language**: TypeScript
- **Styling**: Vanilla CSS with modern CSS features
- **State Management**: Svelte stores
- **API**: SvelteKit server routes

## Project Structure

```
PrahaCodeMonkeys/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── PhotoCard.svelte      # Individual photo card in grid
│   │   │   ├── PhotoModal.svelte     # Full-size photo view with comments
│   │   │   ├── UploadForm.svelte     # Photo upload form
│   │   │   └── UserSwitcher.svelte   # Demo user switcher
│   │   ├── stores/
│   │   │   ├── photos.ts             # Photo state management
│   │   │   └── user.ts               # User state management
│   │   ├── server/
│   │   │   └── db.ts                 # Mock database (in-memory)
│   │   └── types/
│   │       └── index.ts              # TypeScript interfaces
│   └── routes/
│       ├── api/
│       │   ├── photos/
│       │   │   ├── +server.ts        # GET & POST photos
│       │   │   └── [id]/+server.ts   # GET, PATCH & DELETE photo
│       │   └── comments/
│       │       └── +server.ts        # POST & DELETE comments
│       ├── +layout.svelte            # App layout
│       └── +page.svelte              # Main photo feed page
├── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v20.19, v22.12, or v24+)
- pnpm (recommended) or npm

### Installation

1. **Clone the repository** (if not already done)

2. **Install dependencies**:
   ```bash
   pnpm install
   ```
   or
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   pnpm dev
   ```
   or
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

## Usage Guide

### Switching Users (Demo Feature)

At the top of the page, you'll see a user switcher with three demo users:
- 👩 **Alice** (User ID: 1)
- 👨 **Bob** (User ID: 2)
- 🧑 **Charlie** (User ID: 3)

Click any user to switch your current identity and test different permissions.

### Uploading Photos

1. Click the **"➕ Upload New Photo"** button
2. Fill in the title (required)
3. Add a description (optional)
4. Select an image file (max 10MB)
5. Preview your image
6. Click **"Upload Photo"**

### Viewing Photos

- Photos are displayed in a responsive grid
- Scroll down to load more photos automatically (infinite scrolling)
- Click any photo to open it in a modal view

### Photo Modal Features

#### For Photo Owners:
- ✏️ **Edit**: Update title and description
- 🗑️ **Delete**: Remove the photo permanently
- 💬 **Comment**: Add comments like any user

#### For Non-Owners:
- 💬 **Comment**: Add comments to any photo
- 👀 **View**: See photo details and all comments

### Adding Comments

1. Open a photo modal by clicking on any photo
2. Scroll to the comments section at the bottom
3. Type your comment in the text area
4. Click **"Post Comment"**

## API Endpoints

### Photos

- `GET /api/photos?offset=0&limit=10` - Fetch photos with pagination
- `POST /api/photos` - Upload a new photo
- `GET /api/photos/[id]` - Get a specific photo
- `PATCH /api/photos/[id]` - Update a photo (owner only)
- `DELETE /api/photos/[id]` - Delete a photo (owner only)

### Comments

- `POST /api/comments` - Add a comment to a photo
- `DELETE /api/comments` - Delete a comment (owner only)

## Data Model

### User
```typescript
interface User {
  id: string;
  username: string;
  avatar?: string;
}
```

### Photo
```typescript
interface Photo {
  id: string;
  userId: string;
  username: string;
  imageUrl: string;
  title: string;
  description?: string;
  createdAt: string;
  comments: Comment[];
}
```

### Comment
```typescript
interface Comment {
  id: string;
  photoId: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
}
```

## Features Explained

### Infinite Scrolling

The application uses the Intersection Observer API to detect when the user scrolls near the bottom of the page. When triggered, it automatically loads the next batch of photos, providing a seamless browsing experience.

### Permission System

- **Photo Owners** can edit, delete, and comment on their own photos
- **Non-Owners** can only view and comment on others' photos
- All permissions are checked on both client and server side

### Image Handling

For this demo, uploaded images are converted to base64 data URLs. In a production environment, you would:
1. Upload files to cloud storage (AWS S3, Cloudinary, etc.)
2. Store only the URL in your database
3. Implement proper image optimization and CDN delivery

### State Management

The app uses Svelte stores for global state:
- **photosStore**: Manages photos, loading states, and modal visibility
- **user**: Manages current user information

## Customization

### Changing Grid Layout

Edit the CSS in `src/routes/+page.svelte`:
```css
.photo-grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}
```

### Adjusting Infinite Scroll Trigger

Modify the `rootMargin` in `src/routes/+page.svelte`:
```javascript
observer = new IntersectionObserver(
  (entries) => { /* ... */ },
  { rootMargin: "200px" } // Load when 200px from bottom
);
```

### Pagination Limit

Change the limit parameter in API calls:
```typescript
const response = await fetch(`/api/photos?offset=${offset}&limit=10`);
```

## Production Considerations

This is a demo application. For production use, consider:

1. **Database**: Replace in-memory storage with a real database (PostgreSQL, MongoDB, etc.)
2. **Authentication**: Implement proper user authentication (JWT, OAuth, etc.)
3. **File Storage**: Use cloud storage for images
4. **Image Optimization**: Implement image compression and resizing
5. **Rate Limiting**: Add API rate limiting
6. **Validation**: Add comprehensive input validation
7. **Error Handling**: Improve error handling and user feedback
8. **Testing**: Add unit and integration tests
9. **Security**: Implement CSRF protection, content security policy, etc.
10. **Performance**: Add caching, lazy loading, and CDN

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT

## Contributing

Feel free to open issues or submit pull requests!

---

Built with ❤️ using SvelteKit