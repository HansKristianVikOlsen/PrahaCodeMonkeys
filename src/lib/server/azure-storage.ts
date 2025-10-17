/**
 * Azure Blob Storage Utility
 * Handles photo and comment storage in Azure Blob Storage
 */

import { AZURE_PHOTO_STORAGE_URL, AZURE_COMMENT_STORAGE_URL } from '$env/static/private';

export interface BlobUploadResult {
	url: string;
	blobName: string;
}

/**
 * Upload a blob to Azure Storage
 */
export async function uploadBlob(
	containerUrl: string,
	blobName: string,
	content: string | ArrayBuffer,
	contentType: string = 'application/json'
): Promise<BlobUploadResult> {
	const blobUrl = `${containerUrl.split('?')[0]}/${blobName}?${containerUrl.split('?')[1]}`;

	const body = typeof content === 'string' ? content : content;

	const response = await fetch(blobUrl, {
		method: 'PUT',
		headers: {
			'x-ms-blob-type': 'BlockBlob',
			'Content-Type': contentType
		},
		body
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Failed to upload blob: ${response.status} - ${errorText}`);
	}

	// Return the public URL without SAS token for reading
	const publicUrl = blobUrl.split('?')[0];

	return {
		url: publicUrl,
		blobName
	};
}

/**
 * Upload a photo to Azure Blob Storage
 */
export async function uploadPhoto(
	photoId: string,
	imageData: ArrayBuffer,
	contentType: string
): Promise<string> {
	const blobName = `photo-${photoId}.${getExtensionFromContentType(contentType)}`;
	const result = await uploadBlob(AZURE_PHOTO_STORAGE_URL, blobName, imageData, contentType);
	return result.url;
}

/**
 * List all blobs in a container
 */
export async function listBlobs(containerUrl: string): Promise<string[]> {
	const baseUrl = containerUrl.split('?')[0];
	const sasToken = containerUrl.split('?')[1];
	const listUrl = `${baseUrl}?${sasToken}&restype=container&comp=list`;

	const response = await fetch(listUrl);

	if (!response.ok) {
		throw new Error(`Failed to list blobs: ${response.status}`);
	}

	const xmlText = await response.text();

	// Parse XML to get blob names
	const blobNames: string[] = [];
	const nameMatches = xmlText.matchAll(/<Name>([^<]+)<\/Name>/g);

	for (const match of nameMatches) {
		blobNames.push(match[1]);
	}

	return blobNames;
}

/**
 * Get blob content
 */
export async function getBlob(containerUrl: string, blobName: string): Promise<string> {
	const baseUrl = containerUrl.split('?')[0];
	const sasToken = containerUrl.split('?')[1];
	const blobUrl = `${baseUrl}/${blobName}?${sasToken}`;

	const response = await fetch(blobUrl);

	if (!response.ok) {
		if (response.status === 404) {
			throw new Error('Blob not found');
		}
		throw new Error(`Failed to get blob: ${response.status}`);
	}

	return await response.text();
}

/**
 * Delete a blob
 */
export async function deleteBlob(containerUrl: string, blobName: string): Promise<void> {
	const baseUrl = containerUrl.split('?')[0];
	const sasToken = containerUrl.split('?')[1];
	const blobUrl = `${baseUrl}/${blobName}?${sasToken}`;

	const response = await fetch(blobUrl, {
		method: 'DELETE'
	});

	if (!response.ok && response.status !== 404) {
		throw new Error(`Failed to delete blob: ${response.status}`);
	}
}

/**
 * Save photos index (list of all photos)
 */
export async function savePhotosIndex(photos: any[]): Promise<void> {
	const content = JSON.stringify(photos, null, 2);
	await uploadBlob(AZURE_PHOTO_STORAGE_URL, 'photos-index.json', content, 'application/json');
}

/**
 * Get photos index
 */
export async function getPhotosIndex(): Promise<any[]> {
	try {
		const content = await getBlob(AZURE_PHOTO_STORAGE_URL, 'photos-index.json');
		return JSON.parse(content);
	} catch (error) {
		// If index doesn't exist, return empty array
		return [];
	}
}

/**
 * Save comments index (list of all comments)
 */
export async function saveCommentsIndex(comments: any[]): Promise<void> {
	const content = JSON.stringify(comments, null, 2);
	await uploadBlob(AZURE_COMMENT_STORAGE_URL, 'comments-index.json', content, 'application/json');
}

/**
 * Get comments index
 */
export async function getCommentsIndex(): Promise<any[]> {
	try {
		const content = await getBlob(AZURE_COMMENT_STORAGE_URL, 'comments-index.json');
		return JSON.parse(content);
	} catch (error) {
		// If index doesn't exist, return empty array
		return [];
	}
}

/**
 * Get file extension from content type
 */
function getExtensionFromContentType(contentType: string): string {
	const map: Record<string, string> = {
		'image/jpeg': 'jpg',
		'image/jpg': 'jpg',
		'image/png': 'png',
		'image/gif': 'gif',
		'image/webp': 'webp'
	};
	return map[contentType] || 'jpg';
}

/**
 * Convert data URL to ArrayBuffer
 */
export function dataUrlToArrayBuffer(dataUrl: string): { buffer: ArrayBuffer; contentType: string } {
	const parts = dataUrl.split(',');
	const contentType = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
	const base64 = parts[1];

	// Use Node.js Buffer instead of browser atob
	const nodeBuffer = Buffer.from(base64, 'base64');

	// Convert Node.js Buffer to ArrayBuffer
	const buffer = nodeBuffer.buffer.slice(
		nodeBuffer.byteOffset,
		nodeBuffer.byteOffset + nodeBuffer.byteLength
	);

	return { buffer, contentType };
}
