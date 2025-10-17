import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPhotoById, updatePhoto, deletePhoto } from '$lib/server/db';

export const GET: RequestHandler = async ({ params }) => {
  const photo = await getPhotoById(params.id);

  if (!photo) {
    return json({ error: 'Photo not found' }, { status: 404 });
  }

  return json(photo);
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  // Check authentication
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  const userId = locals.user.id;
  const data = await request.json();

  try {
    const photo = await updatePhoto(params.id, userId, data);

    if (!photo) {
      return json({ error: 'Photo not found or unauthorized' }, { status: 404 });
    }

    return json(photo);
  } catch (error) {
    console.error('Failed to update photo:', error);
    return json({ error: 'Failed to update photo' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  // Check authentication
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  const userId = locals.user.id;

  try {
    const success = await deletePhoto(params.id, userId);

    if (!success) {
      return json({ error: 'Photo not found or unauthorized' }, { status: 404 });
    }

    return json({ success: true });
  } catch (error) {
    console.error('Failed to delete photo:', error);
    return json({ error: 'Failed to delete photo' }, { status: 500 });
  }
};
