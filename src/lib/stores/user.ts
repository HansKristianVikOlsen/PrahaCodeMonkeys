import { writable } from 'svelte/store';
import type { User } from '$lib/types';

// Mock current user - in a real app, this would come from authentication
const currentUser: User = {
  id: '1',
  username: 'alice',
  avatar: '👩'
};

export const user = writable<User>(currentUser);

// Helper function to switch users (for demo purposes)
export function switchUser(newUser: User) {
  user.set(newUser);
  // In a real app, you'd also update cookies/session here
  if (typeof document !== 'undefined') {
    document.cookie = `userId=${newUser.id}; path=/`;
    document.cookie = `username=${newUser.username}; path=/`;
  }
}
