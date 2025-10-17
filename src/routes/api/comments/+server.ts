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

  try {
    const comment = await addComment(photoId, userId, username, content);

    if (!comment) {
      return json({ error: 'Photo not found' }, { status: 404 });
    }

    return json(comment, { status: 201 });
  } catch (error) {
    console.error('Failed to add comment:', error);
    return json({ error: 'Failed to add comment' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ request, cookies }) => {
  const userId = cookies.get('userId') || '1';
  const { commentId } = await request.json();

  if (!commentId) {
    return json({ error: 'Comment ID is required' }, { status: 400 });
  }

  try {
    const success = await deleteComment(commentId, userId);

    if (!success) {
      return json({ error: 'Comment not found or unauthorized' }, { status: 404 });
    }

    return json({ success: true });
  } catch (error) {
    console.error('Failed to delete comment:', error);
    return json({ error: 'Failed to delete comment' }, { status: 500 });
  }
};
