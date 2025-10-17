import type { Photo, User, Comment } from '$lib/types';

// Mock users
export const users: User[] = [
  { id: '1', username: 'alice', avatar: '👩' },
  { id: '2', username: 'bob', avatar: '👨' },
  { id: '3', username: 'charlie', avatar: '🧑' }
];

// Mock photos with sample data
export const photos: Photo[] = [
  {
    id: '1',
    userId: '1',
    username: 'alice',
    imageUrl: 'https://picsum.photos/seed/1/800/600',
    title: 'Beautiful Sunset',
    description: 'Captured this amazing sunset yesterday',
    createdAt: new Date('2024-01-15').toISOString(),
    comments: [
      {
        id: 'c1',
        photoId: '1',
        userId: '2',
        username: 'bob',
        content: 'Wow, stunning colors!',
        createdAt: new Date('2024-01-15T10:30:00').toISOString()
      }
    ]
  },
  {
    id: '2',
    userId: '2',
    username: 'bob',
    imageUrl: 'https://picsum.photos/seed/2/800/600',
    title: 'Mountain Adventure',
    description: 'Hiking in the Alps',
    createdAt: new Date('2024-01-14').toISOString(),
    comments: []
  },
  {
    id: '3',
    userId: '1',
    username: 'alice',
    imageUrl: 'https://picsum.photos/seed/3/800/600',
    title: 'City Lights',
    description: 'Downtown at night',
    createdAt: new Date('2024-01-13').toISOString(),
    comments: []
  },
  {
    id: '4',
    userId: '3',
    username: 'charlie',
    imageUrl: 'https://picsum.photos/seed/4/800/600',
    title: 'Ocean Waves',
    description: 'Peaceful morning at the beach',
    createdAt: new Date('2024-01-12').toISOString(),
    comments: []
  },
  {
    id: '5',
    userId: '2',
    username: 'bob',
    imageUrl: 'https://picsum.photos/seed/5/800/600',
    title: 'Forest Path',
    description: 'Lost in nature',
    createdAt: new Date('2024-01-11').toISOString(),
    comments: []
  },
  {
    id: '6',
    userId: '1',
    username: 'alice',
    imageUrl: 'https://picsum.photos/seed/6/800/600',
    title: 'Desert Dunes',
    description: 'Sahara expedition',
    createdAt: new Date('2024-01-10').toISOString(),
    comments: []
  }
];

let photoIdCounter = photos.length + 1;
let commentIdCounter = 100;

export function getPhotos(offset: number = 0, limit: number = 10): Photo[] {
  return photos
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(offset, offset + limit);
}

export function getPhotoById(id: string): Photo | undefined {
  return photos.find((p) => p.id === id);
}

export function createPhoto(
  userId: string,
  username: string,
  title: string,
  imageUrl: string,
  description?: string
): Photo {
  const newPhoto: Photo = {
    id: String(photoIdCounter++),
    userId,
    username,
    imageUrl,
    title,
    description,
    createdAt: new Date().toISOString(),
    comments: []
  };
  photos.unshift(newPhoto);
  return newPhoto;
}

export function updatePhoto(
  id: string,
  userId: string,
  updates: { title?: string; description?: string }
): Photo | null {
  const photo = photos.find((p) => p.id === id);
  if (!photo || photo.userId !== userId) {
    return null;
  }
  if (updates.title !== undefined) photo.title = updates.title;
  if (updates.description !== undefined) photo.description = updates.description;
  return photo;
}

export function deletePhoto(id: string, userId: string): boolean {
  const index = photos.findIndex((p) => p.id === id && p.userId === userId);
  if (index === -1) {
    return false;
  }
  photos.splice(index, 1);
  return true;
}

export function addComment(
  photoId: string,
  userId: string,
  username: string,
  content: string
): Comment | null {
  const photo = photos.find((p) => p.id === photoId);
  if (!photo) {
    return null;
  }
  const comment: Comment = {
    id: String(commentIdCounter++),
    photoId,
    userId,
    username,
    content,
    createdAt: new Date().toISOString()
  };
  photo.comments.push(comment);
  return comment;
}

export function deleteComment(commentId: string, userId: string): boolean {
  for (const photo of photos) {
    const commentIndex = photo.comments.findIndex(
      (c) => c.id === commentId && c.userId === userId
    );
    if (commentIndex !== -1) {
      photo.comments.splice(commentIndex, 1);
      return true;
    }
  }
  return false;
}

export function getUserById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}
