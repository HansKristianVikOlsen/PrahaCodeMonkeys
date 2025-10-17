import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPhotoById, updatePhoto, deletePhoto } from '$lib/server/db';

export const GET: RequestHandler = async ({ params }) => {
  const photo = getPhotoById(params.id);

  if (!photo) {
    return json({ error: 'Photo not found' }, { status: 404 });
  }

  return json(photo);
};

export const PATCH: RequestHandler = async ({ params, request, cookies }) => {
  const userId = cookies.get('userId') || '1';
  const data = await request.json();

  const photo = updatePhoto(params.id, userId, data);

  if (!photo) {
    return json({ error: 'Photo not found or unauthorized' }, { status: 404 });
  }

  return json(photo);
};

export const DELETE: RequestHandler = async ({ params, cookies }) => {
  const userId = cookies.get('userId') || '1';

  const success = deletePhoto(params.id, userId);

  if (!success) {
    return json({ error: 'Photo not found or unauthorized' }, { status: 404 });
  }

  return json({ success: true });
};
