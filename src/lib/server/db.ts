import type { Photo, User, Comment } from '$lib/types';
import {
	uploadPhoto,
	getPhotosIndex,
	savePhotosIndex,
	getCommentsIndex,
	saveCommentsIndex,
	dataUrlToArrayBuffer,
	getPhotoBlobUrl
} from './azure-storage';

// Mock users (still in-memory for demo)
export const users: User[] = [
	{ id: '1', username: 'alice', avatar: '👩' },
	{ id: '2', username: 'bob', avatar: '👨' },
	{ id: '3', username: 'charlie', avatar: '🧑' }
];

// In-memory cache to reduce Azure calls during a session
let photosCache: Photo[] = [];
let photoIdCounter = 1;
let commentIdCounter = 100;
let cacheInitialized = false;

/**
 * Initialize cache from Azure Storage
 */
async function initializeCache() {
	if (cacheInitialized) return;

	try {
		photosCache = await getPhotosIndex();

		// Ensure all photo URLs have current SAS tokens
		photosCache = photosCache.map(photo => {
			// Extract blob name from URL if it's an Azure URL
			if (photo.imageUrl && photo.imageUrl.includes('blob.core.windows.net/photo/')) {
				const blobName = photo.imageUrl.split('/photo/')[1].split('?')[0];
				// Reconstruct URL with current SAS token from .env
				photo.imageUrl = getPhotoBlobUrl(blobName);
			}
			return photo;
		});

		// Set counters based on existing data
		if (photosCache.length > 0) {
			const maxPhotoId = Math.max(...photosCache.map(p => parseInt(p.id) || 0));
			photoIdCounter = maxPhotoId + 1;

			const allComments = photosCache.flatMap(p => p.comments);
			if (allComments.length > 0) {
				const maxCommentId = Math.max(...allComments.map(c => parseInt(c.id) || 0));
				commentIdCounter = maxCommentId + 1;
			}
		}

		cacheInitialized = true;
	} catch (error) {
		console.error('Failed to initialize cache from Azure:', error);
		photosCache = [];
		cacheInitialized = true;
	}
}

/**
 * Sync cache to Azure Storage
 */
async function syncToAzure() {
	try {
		await savePhotosIndex(photosCache);

		// Extract and save comments separately
		const allComments = photosCache.flatMap(p =>
			p.comments.map(c => ({ ...c, photoId: p.id }))
		);
		await saveCommentsIndex(allComments);
	} catch (error) {
		console.error('Failed to sync to Azure:', error);
		throw error;
	}
}

export async function getPhotos(offset: number = 0, limit: number = 10): Promise<Photo[]> {
	await initializeCache();

	return photosCache
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
		.slice(offset, offset + limit);
}

export async function getPhotoById(id: string): Promise<Photo | undefined> {
	await initializeCache();
	return photosCache.find((p) => p.id === id);
}

export async function createPhoto(
	userId: string,
	username: string,
	title: string,
	imageDataUrl: string,
	description?: string
): Promise<Photo> {
	await initializeCache();

	const photoId = String(photoIdCounter++);

	// Upload image to Azure Blob Storage
	let imageUrl: string;
	try {
		const { buffer, contentType } = dataUrlToArrayBuffer(imageDataUrl);
		imageUrl = await uploadPhoto(photoId, buffer, contentType);
	} catch (error) {
		console.error('Failed to upload photo to Azure:', error);
		throw new Error('Failed to upload photo to Azure storage');
	}

	const newPhoto: Photo = {
		id: photoId,
		userId,
		username,
		imageUrl,
		title,
		description,
		createdAt: new Date().toISOString(),
		comments: []
	};

	photosCache.unshift(newPhoto);

	// Sync to Azure in background
	syncToAzure().catch(err => console.error('Background sync failed:', err));

	return newPhoto;
}

export async function updatePhoto(
	id: string,
	userId: string,
	updates: { title?: string; description?: string }
): Promise<Photo | null> {
	await initializeCache();

	const photo = photosCache.find((p) => p.id === id);
	if (!photo || photo.userId !== userId) {
		return null;
	}

	if (updates.title !== undefined) photo.title = updates.title;
	if (updates.description !== undefined) photo.description = updates.description;

	// Sync to Azure
	await syncToAzure();

	return photo;
}

export async function deletePhoto(id: string, userId: string): Promise<boolean> {
	await initializeCache();

	const index = photosCache.findIndex((p) => p.id === id && p.userId === userId);
	if (index === -1) {
		return false;
	}

	photosCache.splice(index, 1);

	// Sync to Azure
	await syncToAzure();

	return true;
}

export async function addComment(
	photoId: string,
	userId: string,
	username: string,
	content: string
): Promise<Comment | null> {
	await initializeCache();

	const photo = photosCache.find((p) => p.id === photoId);
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

	// Sync to Azure
	await syncToAzure();

	return comment;
}

export async function deleteComment(commentId: string, userId: string): Promise<boolean> {
	await initializeCache();

	for (const photo of photosCache) {
		const commentIndex = photo.comments.findIndex(
			(c) => c.id === commentId && c.userId === userId
		);
		if (commentIndex !== -1) {
			photo.comments.splice(commentIndex, 1);

			// Sync to Azure
			await syncToAzure();

			return true;
		}
	}

	return false;
}

export function getUserById(id: string): User | undefined {
	return users.find((u) => u.id === id);
}
