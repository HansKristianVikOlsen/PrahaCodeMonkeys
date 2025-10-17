import { writable, derived } from 'svelte/store';
import type { Photo } from '$lib/types';

export interface PhotosState {
  photos: Photo[];
  loading: boolean;
  hasMore: boolean;
  offset: number;
  selectedPhoto: Photo | null;
  isModalOpen: boolean;
}

const initialState: PhotosState = {
  photos: [],
  loading: false,
  hasMore: true,
  offset: 0,
  selectedPhoto: null,
  isModalOpen: false
};

function createPhotosStore() {
  const { subscribe, set, update } = writable<PhotosState>(initialState);

  return {
    subscribe,

    async loadPhotos(reset: boolean = false) {
      update((state: PhotosState) => ({ ...state, loading: true }));

      try {
        const currentState = initialState;
        update((s: PhotosState) => {
          currentState.offset = s.offset;
          return s;
        });
        const offset = reset ? 0 : currentState.offset;
        const response = await fetch(`/api/photos?offset=${offset}&limit=10`);
        const data = await response.json();

        update((state: PhotosState) => ({
          ...state,
          photos: reset ? data.photos : [...state.photos, ...data.photos],
          hasMore: data.hasMore,
          offset: offset + data.photos.length,
          loading: false
        }));
      } catch (error) {
        console.error('Failed to load photos:', error);
        update((state: PhotosState) => ({ ...state, loading: false }));
      }
    },

    async addPhoto(formData: FormData) {
      try {
        const response = await fetch('/api/photos', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) throw new Error('Failed to upload photo');

        const newPhoto = await response.json();
        update((state: PhotosState) => ({
          ...state,
          photos: [newPhoto, ...state.photos]
        }));

        return true;
      } catch (error) {
        console.error('Failed to add photo:', error);
        return false;
      }
    },

    async updatePhoto(id: string, updates: { title?: string; description?: string }) {
      try {
        const response = await fetch(`/api/photos/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });

        if (!response.ok) throw new Error('Failed to update photo');

        const updatedPhoto = await response.json();
        update((state: PhotosState) => ({
          ...state,
          photos: state.photos.map((p: Photo) => p.id === id ? updatedPhoto : p),
          selectedPhoto: state.selectedPhoto?.id === id ? updatedPhoto : state.selectedPhoto
        }));

        return true;
      } catch (error) {
        console.error('Failed to update photo:', error);
        return false;
      }
    },

    async deletePhoto(id: string) {
      try {
        const response = await fetch(`/api/photos/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete photo');

        update((state: PhotosState) => ({
          ...state,
          photos: state.photos.filter((p: Photo) => p.id !== id),
          selectedPhoto: null,
          isModalOpen: false
        }));

        return true;
      } catch (error) {
        console.error('Failed to delete photo:', error);
        return false;
      }
    },

    async addComment(photoId: string, content: string) {
      try {
        const response = await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photoId, content })
        });

        if (!response.ok) throw new Error('Failed to add comment');

        const newComment = await response.json();
        update((state: PhotosState) => ({
          ...state,
          photos: state.photos.map((p: Photo) =>
            p.id === photoId ? { ...p, comments: [...p.comments, newComment] } : p
          ),
          selectedPhoto: state.selectedPhoto?.id === photoId
            ? { ...state.selectedPhoto, comments: [...state.selectedPhoto.comments, newComment] }
            : state.selectedPhoto
        }));

        return true;
      } catch (error) {
        console.error('Failed to add comment:', error);
        return false;
      }
    },

    openModal(photo: Photo) {
      update((state: PhotosState) => ({
        ...state,
        selectedPhoto: photo,
        isModalOpen: true
      }));
    },

    closeModal() {
      update((state: PhotosState) => ({
        ...state,
        selectedPhoto: null,
        isModalOpen: false
      }));
    },

    reset() {
      set(initialState);
    }
  };
}

// Create a single instance
export const photosStore = createPhotosStore();

// Derived store to get only the state needed for rendering
let state: PhotosState = initialState;
photosStore.subscribe((value: PhotosState) => state = value);
