# 📸 Photo Sharing Application

A modern photo sharing application built with SvelteKit 5, featuring infinite scrolling, CRUD operations, real-time commenting, and Azure Active Directory authentication.

## Features

- 🔐 **Azure AD Authentication**: Secure sign-in with Microsoft accounts
- ✨ **Photo Upload**: Upload photos with title and description
- 🔄 **Infinite Scrolling**: Seamlessly load more photos as you scroll
- 👁️ **Photo Modal**: Click any photo to view it in full size with details
- ✏️ **Edit & Delete**: Photo owners can edit or delete their photos
- 💬 **Comments**: All users can comment on any photo
- 👤 **User Profiles**: View logged-in user information
- 📱 **Responsive Design**: Works great on desktop, tablet, and mobile

## Tech Stack

- **Framework**: SvelteKit 5 with Svelte 5 Runes
- **Language**: TypeScript
- **Styling**: Vanilla CSS with modern CSS features
- **State Management**: Svelte stores
- **API**: SvelteKit server routes
- **Authentication**: Azure Active Directory (Entra ID) with MSAL Node
- **Storage**: Azure Blob Storage for photos and comments

## Project Structure

```
PrahaCodeMonkeys/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── PhotoCard.svelte      # Individual photo card in grid
│   │   │   ├── PhotoModal.svelte     # Full-size photo view with comments
│   │   │   ├── UploadForm.svelte     # Photo upload form
│   │   │   └── UserMenu.svelte       # User menu with logout
│   │   ├── stores/
│   │   │   ├── photos.ts             # Photo state management
│   │   │   └── user.ts               # User state management
│   │   ├── server/
│   │   │   ├── auth/
│   │   │   │   ├── config.ts         # Azure AD MSAL configuration
│   │   │   │   └── session.ts        # Session management utilities
│   │   │   ├── db.ts                 # Database logic with Azure integration
│   │   │   └── azure-storage.ts      # Azure Blob Storage utilities
│   │   └── types/
│   │       └── index.ts              # TypeScript interfaces
│   └── routes/
│       ├── auth/
│       │   ├── login/
│       │   │   ├── +page.svelte      # Login page
│       │   │   └── redirect/+server.ts # Azure AD redirect
│       │   ├── callback/+server.ts   # OAuth callback handler
│       │   └── logout/+server.ts     # Logout handler
│       ├── api/
│       │   ├── photos/
│       │   │   ├── +server.ts        # GET & POST photos
│       │   │   └── [id]/+server.ts   # GET, PATCH & DELETE photo
│       │   └── comments/
│       │       └── +server.ts        # POST & DELETE comments
│       ├── +layout.svelte            # App layout
│       ├── +layout.server.ts         # Server-side layout load
│       └── +page.svelte              # Main photo feed page
├── hooks.server.ts                   # Authentication middleware
├── AZURE_AD_SETUP.md                 # Azure AD setup guide
├── AUTHENTICATION.md                 # Authentication documentation
├── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v20.19, v22.12, or v24+)
- pnpm (recommended) or npm
- Azure Storage Account with SAS tokens
- Azure AD (Entra ID) App Registration

### Installation

1. **Clone the repository** (if not already done)

2. **Set up Azure AD Authentication**:
   
   Follow the comprehensive guide in [AZURE_AD_SETUP.md](./AZURE_AD_SETUP.md) to:
   - Create an Azure AD App Registration
   - Configure redirect URIs
   - Generate client secrets
   - Set up API permissions
   
   Quick summary:
   - Go to [Azure Portal](https://portal.azure.com)
   - Navigate to Azure Active Directory > App registrations > New registration
   - Add redirect URI: `http://localhost:5173/auth/callback`
   - Create a client secret
   - Note your Client ID, Tenant ID, and Client Secret

3. **Configure Azure Blob Storage**:
   
   Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your Azure credentials:
   ```env
   # Azure AD Authentication
   AZURE_AD_CLIENT_ID=your-client-id
   AZURE_AD_CLIENT_SECRET=your-client-secret
   AZURE_AD_TENANT_ID=your-tenant-id
   AZURE_AD_REDIRECT_URI=http://localhost:5173/auth/callback
   
   # Azure Blob Storage
   AZURE_PHOTO_STORAGE_URL=https://your-account.blob.core.windows.net/photo?sp=racwdli&st=...&sig=...
   AZURE_COMMENT_STORAGE_URL=https://your-account.blob.core.windows.net/comment?sp=racwdli&st=...&sig=...
   ```
   
   **Requirements**:
   - Azure AD credentials must be valid
   - SAS Token Permissions: `racwdli` (read, add, create, write, delete, list, immutable)
   - SAS Token Resource type: Container
   - Ensure tokens have not expired

4. **Install dependencies**:
   ```bash
   pnpm install
   ```
   or
   ```bash
   npm install
   ```

5. **Start the development server**:
   ```bash
   pnpm dev
   ```
   or
   ```bash
   npm run dev
   ```

6. **Sign in with your Microsoft account**:
   - Open your browser and navigate to `http://localhost:5173`
   - You'll be redirected to the login page
   - Click "Sign in with Microsoft"
   - Enter your Microsoft/Azure AD credentials
   - After successful authentication, you'll be redirected to the photo gallery

## Azure Blob Storage Integration

### How It Works

This application uses Azure Blob Storage for persistent data storage:

- **Photo Container**: Stores uploaded images as blobs
- **Comment Container**: Stores photo metadata and comments as JSON files
- **Index Files**: `photos-index.json` and `comments-index.json` maintain the list of all data

### Data Structure

**Photo Blob Naming**: `photo-{photoId}.{extension}` (e.g., `photo-1.jpg`)

**Index Files**:
- `photos-index.json` - Array of all photo metadata with image URLs
- `comments-index.json` - Array of all comments

### Getting SAS Tokens

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your Storage Account
3. Select **Shared access signature** from the left menu
4. Configure permissions:
   - **Allowed services**: Blob
   - **Allowed resource types**: Container and Object
   - **Allowed permissions**: Read, Add, Create, Write, Delete, List
5. Set expiration date
6. Click **Generate SAS and connection string**
7. Copy the **Blob service SAS URL**

### Environment Variables

| Variable | Description |
|----------|-------------|
| `AZURE_AD_CLIENT_ID` | Azure AD application client ID |
| `AZURE_AD_CLIENT_SECRET` | Azure AD client secret |
| `AZURE_AD_TENANT_ID` | Azure AD tenant (directory) ID |
| `AZURE_AD_REDIRECT_URI` | OAuth callback URL |
| `AZURE_PHOTO_STORAGE_URL` | SAS URL for photo container |
| `AZURE_COMMENT_STORAGE_URL` | SAS URL for comment container |
| `AZURE_STORAGE_ACCOUNT` | Storage account name (optional) |
| `AZURE_PHOTO_CONTAINER` | Photo container name (optional) |
| `AZURE_COMMENT_CONTAINER` | Comment container name (optional) |

## Usage Guide

### Authentication

When you first visit the application, you'll need to sign in:

1. Click **"Sign in with Microsoft"** on the login page
2. Enter your Microsoft/Azure AD credentials
3. Grant permissions if prompted
4. You'll be redirected back to the app

To sign out:
1. Click your username in the top-right corner
2. Click **"Sign out"** from the dropdown menu

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

This application uses Azure Blob Storage for data persistence and Azure AD for authentication. For production use, consider:

1. **Session Storage**: Replace in-memory sessions with Redis or database
2. **Secret Management**: Use Azure Key Vault for production secrets
3. **Database**: Optionally add a relational database for complex queries
4. **Image Optimization**: Implement image compression and resizing
5. **Rate Limiting**: Add API rate limiting
6. **Validation**: Add comprehensive input validation
7. **Error Handling**: Improve error handling and user feedback
8. **Testing**: Add unit and integration tests
9. **Security**: Implement additional security headers and policies
10. **Performance**: Add caching, CDN, and optimize Azure calls
11. **SAS Token Management**: Implement token rotation and secure storage
12. **Monitoring**: Add application insights and logging

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT

## Documentation

- **[AZURE_AD_SETUP.md](./AZURE_AD_SETUP.md)** - Complete Azure AD setup guide
- **[AUTHENTICATION.md](./AUTHENTICATION.md)** - Authentication system overview
- **[AZURE_SETUP.md](./AZURE_SETUP.md)** - Azure Blob Storage setup
- **[AZURE_INTEGRATION.md](./AZURE_INTEGRATION.md)** - Storage integration details
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions

## Contributing

Feel free to open issues or submit pull requests!

---

Built with ❤️ using SvelteKit