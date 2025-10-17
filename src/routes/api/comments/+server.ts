import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addComment, deleteComment } from '$lib/server/db';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const userId = cookies.get('userId') || '1';
  const username = cookies.get('username') || 'alice';

  const { photoId, content } = await request.json();

  if (!photoId || !content) {
    return json({ error: 'Photo ID and content are required' }, { status: 400 });
  }

  const comment = addComment(photoId, userId, username, content);

  if (!comment) {
    return json({ error: 'Photo not found' }, { status: 404 });
  }

  return json(comment, { status: 201 });
};

export const DELETE: RequestHandler = async ({ request, cookies }) => {
  const userId = cookies.get('userId') || '1';
  const { commentId } = await request.json();

  if (!commentId) {
    return json({ error: 'Comment ID is required' }, { status: 400 });
  }

  const success = deleteComment(commentId, userId);

  if (!success) {
    return json({ error: 'Comment not found or unauthorized' }, { status: 404 });
  }

  return json({ success: true });
};
