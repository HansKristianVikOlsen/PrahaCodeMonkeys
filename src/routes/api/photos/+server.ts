import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPhotos, createPhoto } from '$lib/server/db';

export const GET: RequestHandler = async ({ url }) => {
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const limit = parseInt(url.searchParams.get('limit') || '10');

  const photos = getPhotos(offset, limit);

  return json({
    photos,
    hasMore: photos.length === limit
  });
};

export const POST: RequestHandler = async ({ request, cookies }) => {
  const userId = cookies.get('userId') || '1'; // Mock authentication
  const username = cookies.get('username') || 'alice';

  const formData = await request.formData();
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const imageFile = formData.get('image') as File;

  if (!title || !imageFile) {
    return json({ error: 'Title and image are required' }, { status: 400 });
  }

  // In a real app, you'd upload the file to cloud storage
  // For this demo, we'll convert to base64 or use a placeholder
  const imageUrl = imageFile.size > 0
    ? await fileToDataURL(imageFile)
    : `https://picsum.photos/seed/${Date.now()}/800/600`;

  const photo = createPhoto(userId, username, title, imageUrl, description);

  return json(photo, { status: 201 });
};

async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
