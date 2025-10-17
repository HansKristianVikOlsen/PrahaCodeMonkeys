# 🏗️ Application Architecture

This document explains the architecture and design decisions of the Photo Sharing Application.

## Overview

The application follows a modern SvelteKit architecture with clear separation of concerns between presentation, state management, and data layers.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              UI Components (Svelte)                     │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │ │
│  │  │PhotoCard │  │PhotoModal│  │UploadForm│  ...       │ │
│  │  └──────────┘  └──────────┘  └──────────┘            │ │
│  └────────────────────────────────────────────────────────┘ │
│                        ↕                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              State Management (Stores)                  │ │
│  │         photosStore  │  userStore                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                        ↕                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                 API Client (Fetch)                      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                         ↕ HTTP/JSON
┌─────────────────────────────────────────────────────────────┐
│                    SvelteKit Server                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              API Routes (+server.ts)                    │ │
│  │  /api/photos  │  /api/photos/[id]  │  /api/comments   │ │
│  └────────────────────────────────────────────────────────┘ │
│                        ↕                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Business Logic (db.ts)                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                        ↕                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Data Storage (In-Memory)                   │ │
│  │         Photos Array  │  Users Array                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Layer Breakdown

### 1. Presentation Layer (Components)

**Location**: `/src/lib/components/`

#### Components:

- **PhotoCard.svelte**: Displays a single photo in the grid
  - Thumbnail image
  - Title and author
  - Comment count
  - Click handler for modal

- **PhotoModal.svelte**: Full-screen photo viewer
  - Large photo display
  - Photo details (title, description, author, date)
  - Comments section with real-time updates
  - Edit/Delete actions (owner only)
  - Comment form

- **UploadForm.svelte**: Photo upload interface
  - Form validation
  - File input with preview
  - Image size/type validation
  - Upload progress state

- **UserSwitcher.svelte**: Demo user selection
  - Visual user representation
  - Active user highlighting
  - Cookie management for session

#### Design Patterns:

- **Svelte 5 Runes**: Using `$state`, `$derived`, and `$props` for reactive state
- **Props Interface**: Type-safe component props
- **Event Handlers**: Callback props for user interactions
- **Scoped Styles**: Component-specific CSS with no global pollution

### 2. State Management Layer (Stores)

**Location**: `/src/lib/stores/`

#### photosStore.ts

Manages the entire photo lifecycle and UI state:

**State**:
```typescript
{
  photos: Photo[];          // Array of photo objects
  loading: boolean;         // Loading indicator
  hasMore: boolean;         // Pagination flag
  offset: number;           // Current pagination offset
  selectedPhoto: Photo;     // Currently viewed photo in modal
  isModalOpen: boolean;     // Modal visibility state
}
```

**Actions**:
- `loadPhotos(reset)`: Fetch photos with pagination
- `addPhoto(formData)`: Upload new photo
- `updatePhoto(id, updates)`: Edit photo metadata
- `deletePhoto(id)`: Remove photo
- `addComment(photoId, content)`: Post comment
- `openModal(photo)`: Show photo in modal
- `closeModal()`: Hide modal

#### userStore.ts

Manages current user session:

**State**:
```typescript
{
  id: string;
  username: string;
  avatar: string;
}
```

**Actions**:
- `switchUser(user)`: Change active user (demo only)

### 3. API Layer (Routes)

**Location**: `/src/routes/api/`

#### RESTful Endpoints:

**Photos**:
- `GET /api/photos?offset=0&limit=10` - List photos (paginated)
- `POST /api/photos` - Create photo (multipart/form-data)
- `GET /api/photos/[id]` - Get single photo
- `PATCH /api/photos/[id]` - Update photo (owner only)
- `DELETE /api/photos/[id]` - Delete photo (owner only)

**Comments**:
- `POST /api/comments` - Add comment
- `DELETE /api/comments` - Remove comment (owner only)

#### Request/Response Flow:

```
Client → API Route → Business Logic → Data Store → Response
```

#### Security:

- User ID validation from cookies
- Ownership verification for mutations
- Input validation and sanitization
- Error handling with appropriate HTTP status codes

### 4. Business Logic Layer

**Location**: `/src/lib/server/db.ts`

#### Responsibilities:

- Data validation
- CRUD operations
- Data transformation
- Authorization checks

#### Functions:

**Photos**:
- `getPhotos(offset, limit)`: Paginated photo retrieval
- `getPhotoById(id)`: Single photo lookup
- `createPhoto(...)`: New photo creation
- `updatePhoto(id, userId, updates)`: Photo modification
- `deletePhoto(id, userId)`: Photo removal

**Comments**:
- `addComment(...)`: Comment creation
- `deleteComment(commentId, userId)`: Comment removal

**Users**:
- `getUserById(id)`: User lookup

### 5. Data Storage Layer

**Location**: In-memory arrays in `/src/lib/server/db.ts`

#### Current Implementation:

```typescript
const photos: Photo[] = [...];
const users: User[] = [...];
```

#### Characteristics:

- ✅ Fast development and testing
- ✅ No external dependencies
- ❌ Data lost on server restart
- ❌ Not suitable for production

#### Production Alternative:

Replace with:
- **PostgreSQL**: Relational data with ACID guarantees
- **MongoDB**: Document-based storage
- **Supabase**: Backend-as-a-Service
- **Prisma ORM**: Type-safe database access

## Data Flow Examples

### 1. Loading Photos (Infinite Scroll)

```
User scrolls near bottom
    ↓
IntersectionObserver triggers
    ↓
photosStore.loadPhotos() called
    ↓
GET /api/photos?offset=10&limit=10
    ↓
Server: getPhotos(10, 10)
    ↓
Server: Return photos array slice
    ↓
Store: Append to existing photos
    ↓
Component: Re-render with new photos
```

### 2. Uploading a Photo

```
User fills form and submits
    ↓
UploadForm converts file to FormData
    ↓
photosStore.addPhoto(formData)
    ↓
POST /api/photos (multipart/form-data)
    ↓
Server: Extract form fields
    ↓
Server: Convert image to data URL
    ↓
Server: createPhoto() adds to array
    ↓
Server: Return new photo object
    ↓
Store: Prepend to photos array
    ↓
Component: Re-render with new photo
    ↓
Form: Reset and close
```

### 3. Commenting on a Photo

```
User types comment and submits
    ↓
PhotoModal calls photosStore.addComment()
    ↓
POST /api/comments {photoId, content}
    ↓
Server: Extract userId from cookies
    ↓
Server: addComment() appends to photo.comments
    ↓
Server: Return new comment object
    ↓
Store: Update photo in array
    ↓
Store: Update selectedPhoto
    ↓
Component: Re-render with new comment
    ↓
Form: Clear input
```

## Key Design Decisions

### 1. SvelteKit Framework

**Why?**
- Server-side rendering capabilities
- Built-in routing
- API routes (no separate backend needed)
- Excellent developer experience
- Small bundle sizes

### 2. Svelte 5 Runes

**Why?**
- Modern reactive system
- Better TypeScript support
- More predictable behavior
- Cleaner component code

### 3. In-Memory Storage

**Why?**
- Rapid prototyping
- No database setup required
- Focus on frontend features
- Easy to replace later

**When to replace?**
- Moving to production
- Need data persistence
- Multiple server instances
- Advanced querying

### 4. Infinite Scrolling

**Why?**
- Better UX for large datasets
- Reduces initial load time
- Modern social media pattern
- Native browser API (IntersectionObserver)

**Trade-offs**:
- More complex state management
- URL doesn't reflect position
- Back button behavior

### 5. Modal for Photo Details

**Why?**
- Keeps context (grid position)
- Quick interaction
- Mobile-friendly
- Focuses attention

**Alternative**: Separate detail page with routing

### 6. Base64 Image Storage

**Why (Demo Only)?**
- No external services needed
- Immediate preview
- Self-contained application

**Production Alternative**:
- Cloud storage (S3, Cloudinary)
- Image optimization pipeline
- CDN delivery
- Thumbnail generation

## Performance Considerations

### Optimizations:

1. **Lazy Loading**: Images load as they enter viewport
2. **Pagination**: Load data in chunks
3. **Component-Scoped CSS**: No global CSS overhead
4. **Reactive Updates**: Only re-render changed components
5. **Debouncing**: Could be added for search/filter

### Potential Improvements:

1. **Virtual Scrolling**: For very large lists
2. **Image Optimization**: Resize and compress uploads
3. **Caching**: Client-side cache for viewed photos
4. **Service Worker**: Offline support
5. **Code Splitting**: Lazy load modal component

## Security Considerations

### Current Implementation:

- ✅ User ID from HTTP-only cookies
- ✅ Server-side authorization checks
- ✅ File type validation
- ✅ File size limits
- ⚠️ Basic XSS prevention (need sanitization)

### Production Requirements:

- 🔒 JWT or session-based auth
- 🔒 CSRF token protection
- 🔒 Rate limiting on uploads
- 🔒 Content security policy
- 🔒 Input sanitization
- 🔒 SQL injection prevention (if using SQL DB)
- 🔒 Signed URLs for image uploads

## Scalability Path

### Current Limitations:

- Single server instance
- In-memory storage
- No caching layer
- Synchronous operations

### Scaling Strategy:

1. **Database**: Move to PostgreSQL/MongoDB
2. **File Storage**: Use S3 or similar
3. **CDN**: CloudFront for images
4. **Load Balancer**: Multiple app instances
5. **Redis**: Session storage and caching
6. **Message Queue**: Async image processing
7. **Microservices**: Separate photo and comment services

## Testing Strategy

### Unit Tests:

- Store actions and state updates
- Utility functions
- API route handlers

### Integration Tests:

- Component interactions
- Store + API integration
- End-to-end user flows

### E2E Tests:

- Photo upload flow
- Comment submission
- Infinite scroll behavior
- Modal interactions

## Future Enhancements

### Features:

- 🎯 User profiles and following
- 🎯 Photo likes and favorites
- 🎯 Search and filtering
- 🎯 Tags and categories
- 🎯 Photo albums/collections
- 🎯 Direct messaging
- 🎯 Notifications
- 🎯 Photo editing tools

### Technical:

- 🛠️ Real-time updates (WebSockets)
- 🛠️ Progressive Web App
- 🛠️ Dark mode
- 🛠️ Internationalization
- 🛠️ Analytics integration
- 🛠️ A/B testing framework

## Conclusion

This architecture provides a solid foundation for a photo sharing application while maintaining flexibility for future growth. The clear separation of concerns makes it easy to:

- Add new features
- Replace components
- Scale individual layers
- Test in isolation
- Maintain over time

The modular design allows developers to work on different layers independently, and the type-safe TypeScript interfaces ensure consistency across the application.