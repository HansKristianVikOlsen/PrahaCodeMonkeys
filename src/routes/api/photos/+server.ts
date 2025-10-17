import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPhotos, createPhoto } from '$lib/server/db';

export const GET: RequestHandler = async ({ url }) => {
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const limit = parseInt(url.searchParams.get('limit') || '10');

  const photos = await getPhotos(offset, limit);

  return json({
    photos,
    hasMore: photos.length === limit
  });
};

export const POST: RequestHandler = async ({ request, locals }) => {
  // Check authentication
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  const userId = locals.user.id;
  const username = locals.user.username;

  const formData = await request.formData();
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const imageFile = formData.get('image') as File;

  if (!title || !imageFile) {
    return json({ error: 'Title and image are required' }, { status: 400 });
  }

  try {
    // Convert image file to data URL using Node.js Buffer
    const imageDataUrl = await fileToDataURL(imageFile);
    const photo = await createPhoto(userId, username, title, imageDataUrl, description);
    return json(photo, { status: 201 });
  } catch (error) {
    console.error('Failed to create photo:', error);
    return json({ error: 'Failed to upload photo' }, { status: 500 });
  }
};

async function fileToDataURL(file: File): Promise<string> {
  // Get the file content as ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // Convert ArrayBuffer to Buffer (Node.js)
  const buffer = Buffer.from(arrayBuffer);

  // Convert to base64
  const base64 = buffer.toString('base64');

  // Create data URL with proper MIME type
  const mimeType = file.type || 'image/jpeg';
  const dataUrl = `data:${mimeType};base64,${base64}`;

  return dataUrl;
}
