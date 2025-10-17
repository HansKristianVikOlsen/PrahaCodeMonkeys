# 🧑‍💻 Development Guide

This guide is for developers who want to extend, modify, or contribute to the Photo Sharing Application.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Standards](#project-standards)
- [Component Development](#component-development)
- [Adding New Features](#adding-new-features)
- [API Development](#api-development)
- [State Management](#state-management)
- [Styling Guidelines](#styling-guidelines)
- [Testing](#testing)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

## Development Setup

### Environment Setup

1. **Install Node.js**
   ```bash
   # Using nvm (recommended)
   nvm install 22.12.0
   nvm use 22.12.0
   ```

2. **Install pnpm**
   ```bash
   npm install -g pnpm
   ```

3. **Install Dependencies**
   ```bash
   pnpm install
   ```

4. **Start Development Server**
   ```bash
   pnpm dev
   ```

### Development Tools

- **VS Code** (recommended)
  - Svelte for VS Code extension
  - Svelte Intellisense
  - ESLint
  - Prettier

- **Browser DevTools**
  - Chrome/Firefox DevTools
  - Svelte DevTools extension

### Useful Commands

```bash
# Development server with hot reload
pnpm dev

# Type checking
pnpm check

# Type checking in watch mode
pnpm check:watch

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Project Standards

### Code Style

- **TypeScript**: Strict mode enabled
- **Naming Conventions**:
  - Components: PascalCase (e.g., `PhotoCard.svelte`)
  - Functions: camelCase (e.g., `loadPhotos`)
  - Constants: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
  - Interfaces: PascalCase (e.g., `Photo`, `Comment`)

### File Organization

```
src/
├── lib/
│   ├── components/       # Reusable UI components
│   ├── stores/          # Global state management
│   ├── server/          # Server-side code
│   ├── types/           # TypeScript type definitions
│   └── utils.ts         # Utility functions
└── routes/
    ├── api/             # API endpoints
    └── ...              # Pages and layouts
```

### Import Order

```typescript
// 1. Svelte imports
import { onMount } from 'svelte';

// 2. SvelteKit imports
import { browser } from '$app/environment';

// 3. Type imports
import type { Photo } from '$lib/types';

// 4. Store imports
import { photosStore } from '$lib/stores/photos';

// 5. Component imports
import PhotoCard from '$lib/components/PhotoCard.svelte';

// 6. Utility imports
import { formatDate } from '$lib/utils';
```

## Component Development

### Creating a New Component

1. **Create the file** in `src/lib/components/`
2. **Define the interface** for props
3. **Implement the component** using Svelte 5 Runes
4. **Add scoped styles**

#### Example Component Template

```svelte
<script lang="ts">
  import type { MyType } from '$lib/types';

  interface Props {
    data: MyType;
    onAction?: (id: string) => void;
  }

  let { data, onAction }: Props = $props();

  // Local state
  let isActive = $state(false);

  // Derived state
  const displayText = $derived(data.text.toUpperCase());

  // Functions
  function handleClick() {
    isActive = !isActive;
    onAction?.(data.id);
  }
</script>

<div class="my-component" class:active={isActive}>
  <h3>{displayText}</h3>
  <button onclick={handleClick}>Toggle</button>
</div>

<style>
  .my-component {
    padding: 1rem;
    border-radius: 8px;
    background: white;
  }

  .my-component.active {
    background: #e3f2fd;
  }
</style>
```

### Component Best Practices

- ✅ Use TypeScript for all props
- ✅ Provide default values where appropriate
- ✅ Use semantic HTML elements
- ✅ Keep components focused and single-purpose
- ✅ Use scoped styles (avoid global CSS)
- ✅ Handle loading and error states
- ✅ Make components accessible (ARIA labels)
- ✅ Use `$derived` for computed values
- ✅ Use `$state` for reactive local state

## Adding New Features

### Feature Development Workflow

1. **Plan the feature**
   - Define requirements
   - Design data structure
   - Sketch UI/UX

2. **Update types** (if needed)
   - Add interfaces in `src/lib/types/index.ts`

3. **Create/update backend**
   - Add functions to `src/lib/server/db.ts`
   - Create API routes in `src/routes/api/`

4. **Update stores** (if needed)
   - Add state in store
   - Create actions

5. **Build UI components**
   - Create new components
   - Update existing components

6. **Test the feature**
   - Manual testing
   - Check edge cases
   - Test responsiveness

### Example: Adding a "Like" Feature

#### Step 1: Update Types

```typescript
// src/lib/types/index.ts
export interface Photo {
  // ... existing fields
  likes: string[]; // Array of user IDs who liked
  likeCount: number;
}
```

#### Step 2: Update Backend

```typescript
// src/lib/server/db.ts
export function toggleLike(photoId: string, userId: string): Photo | null {
  const photo = photos.find(p => p.id === photoId);
  if (!photo) return null;

  const likeIndex = photo.likes.indexOf(userId);
  if (likeIndex > -1) {
    photo.likes.splice(likeIndex, 1);
  } else {
    photo.likes.push(userId);
  }
  photo.likeCount = photo.likes.length;
  
  return photo;
}
```

#### Step 3: Create API Route

```typescript
// src/routes/api/photos/[id]/like/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { toggleLike } from '$lib/server/db';

export const POST: RequestHandler = async ({ params, cookies }) => {
  const userId = cookies.get('userId') || '1';
  const photo = toggleLike(params.id, userId);

  if (!photo) {
    return json({ error: 'Photo not found' }, { status: 404 });
  }

  return json(photo);
};
```

#### Step 4: Update Store

```typescript
// src/lib/stores/photos.ts
async toggleLike(photoId: string) {
  try {
    const response = await fetch(`/api/photos/${photoId}/like`, {
      method: 'POST'
    });

    if (!response.ok) throw new Error('Failed to toggle like');

    const updatedPhoto = await response.json();
    update((state: PhotosState) => ({
      ...state,
      photos: state.photos.map((p: Photo) => 
        p.id === photoId ? updatedPhoto : p
      )
    }));

    return true;
  } catch (error) {
    console.error('Failed to toggle like:', error);
    return false;
  }
}
```

#### Step 5: Update UI

```svelte
<!-- src/lib/components/PhotoCard.svelte -->
<button 
  class="like-button" 
  onclick={() => handleLike(photo.id)}
>
  {photo.likes.includes($user.id) ? '❤️' : '🤍'} {photo.likeCount}
</button>
```

## API Development

### Creating New API Routes

#### GET Endpoint

```typescript
// src/routes/api/resource/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getData } from '$lib/server/db';

export const GET: RequestHandler = async ({ url }) => {
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const data = getData(limit);
  
  return json({ data });
};
```

#### POST Endpoint

```typescript
export const POST: RequestHandler = async ({ request, cookies }) => {
  const userId = cookies.get('userId') || '1';
  const body = await request.json();

  // Validate input
  if (!body.title) {
    return json({ error: 'Title is required' }, { status: 400 });
  }

  // Process data
  const result = createData(userId, body);

  return json(result, { status: 201 });
};
```

#### Dynamic Route

```typescript
// src/routes/api/resource/[id]/+server.ts
export const GET: RequestHandler = async ({ params }) => {
  const data = getById(params.id);

  if (!data) {
    return json({ error: 'Not found' }, { status: 404 });
  }

  return json(data);
};
```

### API Best Practices

- ✅ Always validate input
- ✅ Check user permissions
- ✅ Return appropriate HTTP status codes
- ✅ Use consistent error format
- ✅ Handle edge cases
- ✅ Log errors for debugging
- ✅ Document expected request/response

## State Management

### When to Use Stores

Use stores for:
- Global application state
- Data shared across components
- State that persists across navigation
- Complex state logic

Use local state for:
- Component-specific UI state
- Temporary form data
- Animation states

### Creating a New Store

```typescript
// src/lib/stores/myStore.ts
import { writable, derived } from 'svelte/store';
import type { MyData } from '$lib/types';

interface MyState {
  items: MyData[];
  loading: boolean;
  error: string | null;
}

const initialState: MyState = {
  items: [],
  loading: false,
  error: null
};

function createMyStore() {
  const { subscribe, set, update } = writable<MyState>(initialState);

  return {
    subscribe,

    async loadItems() {
      update(s => ({ ...s, loading: true, error: null }));

      try {
        const response = await fetch('/api/items');
        const data = await response.json();

        update(s => ({ ...s, items: data, loading: false }));
      } catch (error) {
        update(s => ({ 
          ...s, 
          loading: false, 
          error: 'Failed to load items' 
        }));
      }
    },

    reset() {
      set(initialState);
    }
  };
}

export const myStore = createMyStore();
```

## Styling Guidelines

### CSS Organization

```css
/* 1. Layout */
.component {
  display: flex;
  flex-direction: column;
}

/* 2. Positioning */
.component {
  position: relative;
}

/* 3. Box model */
.component {
  width: 100%;
  padding: 16px;
  margin: 0 auto;
}

/* 4. Typography */
.component {
  font-size: 16px;
  line-height: 1.5;
}

/* 5. Visual */
.component {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 6. Animation */
.component {
  transition: all 0.2s;
}

/* 7. Misc */
.component {
  cursor: pointer;
}
```

### Responsive Design

```css
/* Mobile first */
.component {
  grid-template-columns: 1fr;
}

/* Tablet */
@media (min-width: 768px) {
  .component {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .component {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### CSS Variables

```css
/* Define in :global() */
:global(:root) {
  --color-primary: #0066cc;
  --color-secondary: #666;
  --spacing-small: 8px;
  --spacing-medium: 16px;
  --spacing-large: 24px;
  --border-radius: 8px;
}

/* Use in components */
.button {
  background: var(--color-primary);
  padding: var(--spacing-medium);
  border-radius: var(--border-radius);
}
```

## Testing

### Manual Testing Checklist

- [ ] All CRUD operations work
- [ ] Form validation works correctly
- [ ] Error states display properly
- [ ] Loading states show correctly
- [ ] Responsive on mobile, tablet, desktop
- [ ] Keyboard navigation works
- [ ] Images load correctly
- [ ] Infinite scroll triggers properly
- [ ] Modal opens and closes
- [ ] Comments post and display

### Testing User Flows

1. **Upload Photo Flow**
   - Open upload form
   - Validate required fields
   - Preview image
   - Submit form
   - Verify photo appears

2. **Edit Photo Flow**
   - Open photo modal
   - Click edit button
   - Modify fields
   - Save changes
   - Verify updates

3. **Comment Flow**
   - Open photo modal
   - Type comment
   - Submit comment
   - Verify comment appears

## Common Tasks

### Adding a New Page

```svelte
<!-- src/routes/my-page/+page.svelte -->
<script lang="ts">
  // Your code here
</script>

<svelte:head>
  <title>My Page</title>
</svelte:head>

<main>
  <h1>My Page</h1>
  <!-- Content -->
</main>

<style>
  /* Styles */
</style>
```

### Adding a New Utility Function

```typescript
// src/lib/utils.ts

/**
 * Description of what the function does
 * @param param1 - Description
 * @returns Description
 */
export function myUtility(param1: string): string {
  // Implementation
  return param1.toUpperCase();
}
```

### Updating the Database Schema

1. Update types in `src/lib/types/index.ts`
2. Update mock data in `src/lib/server/db.ts`
3. Update API endpoints if needed
4. Update components using the data

## Troubleshooting

### Common Issues

#### 1. Type Errors

```
Error: Type 'X' is not assignable to type 'Y'
```

**Solution**: Check TypeScript interfaces match data structure

#### 2. Module Not Found

```
Error: Cannot find module '$lib/...'
```

**Solution**: Run `pnpm run prepare` to generate types

#### 3. Hydration Mismatch

```
Warning: Hydration failed
```

**Solution**: Ensure server and client render the same HTML initially

#### 4. Store Subscription Memory Leak

**Solution**: Always unsubscribe from stores in `onDestroy`

```typescript
onMount(() => {
  const unsubscribe = myStore.subscribe(value => {
    // Use value
  });

  return () => {
    unsubscribe();
  };
});
```

### Debugging Tips

1. **Use console.log strategically**
   ```typescript
   console.log('State:', $photosStore);
   ```

2. **Check Network tab** for API calls

3. **Use Svelte DevTools** to inspect component state

4. **Add error boundaries** for graceful error handling

5. **Check browser console** for errors and warnings

## Additional Resources

### Official Documentation
- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [Svelte 5 Runes](https://svelte-5-preview.vercel.app/docs/runes)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

### Community
- [Svelte Discord](https://svelte.dev/chat)
- [Svelte Reddit](https://www.reddit.com/r/sveltejs/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/svelte)

### Tools
- [Svelte REPL](https://svelte.dev/repl) - Online playground
- [Svelte Summit](https://www.sveltesummit.com/) - Conference talks

## Contributing Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages
6. Push to your fork
7. Open a Pull Request

### Commit Message Format

```
type(scope): brief description

Longer description if needed

- Bullet points for details
- More details

Closes #123
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

Happy coding! 🚀

For questions or issues, refer to the other documentation files or open an issue on GitHub.