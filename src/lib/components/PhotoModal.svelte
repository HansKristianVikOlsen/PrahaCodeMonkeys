<script lang="ts">
    import type { Photo } from "$lib/types";
    import { user } from "$lib/stores/user";
    import { photosStore } from "$lib/stores/photos";

    interface Props {
        photo: Photo;
        isOpen: boolean;
        onClose: () => void;
    }

    let { photo, isOpen, onClose }: Props = $props();

    let commentText = $state("");
    let isEditing = $state(false);
    let editTitle = $state(photo.title);
    let editDescription = $state(photo.description || "");

    const currentUser = $derived($user);
    const isOwner = $derived(photo.userId === currentUser.id);

    function handleBackdropClick(e: MouseEvent) {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }

    async function handleAddComment() {
        if (!commentText.trim()) return;
        const success = await photosStore.addComment(photo.id, commentText);
        if (success) {
            commentText = "";
        }
    }

    async function handleDelete() {
        if (confirm("Are you sure you want to delete this photo?")) {
            await photosStore.deletePhoto(photo.id);
            onClose();
        }
    }

    function startEdit() {
        editTitle = photo.title;
        editDescription = photo.description || "";
        isEditing = true;
    }

    async function handleUpdate() {
        const success = await photosStore.updatePhoto(photo.id, {
            title: editTitle,
            description: editDescription,
        });
        if (success) {
            isEditing = false;
        }
    }

    function cancelEdit() {
        isEditing = false;
        editTitle = photo.title;
        editDescription = photo.description || "";
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            if (isEditing) {
                cancelEdit();
            } else {
                onClose();
            }
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
    <div
        class="modal-backdrop"
        onclick={handleBackdropClick}
        role="presentation"
    >
        <div
            class="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <button
                class="close-button"
                onclick={onClose}
                aria-label="Close modal">✕</button
            >

            <div class="modal-body">
                <div class="modal-left">
                    <img
                        src={photo.imageUrl}
                        alt={photo.title}
                        class="modal-image"
                    />
                </div>

                <div class="modal-right">
                    <div class="photo-header">
                        {#if isEditing}
                            <input
                                type="text"
                                bind:value={editTitle}
                                class="edit-input title-input"
                                placeholder="Title"
                            />
                            <textarea
                                bind:value={editDescription}
                                class="edit-input description-input"
                                placeholder="Description (optional)"
                                rows="2"
                            ></textarea>
                            <div class="edit-actions">
                                <button
                                    class="btn btn-secondary"
                                    onclick={cancelEdit}>Cancel</button
                                >
                                <button
                                    class="btn btn-primary"
                                    onclick={handleUpdate}>Save</button
                                >
                            </div>
                        {:else}
                            <div>
                                <h2 id="modal-title" class="photo-title-large">
                                    {photo.title}
                                </h2>
                                {#if photo.description}
                                    <p class="photo-description">
                                        {photo.description}
                                    </p>
                                {/if}
                                <div class="photo-author-info">
                                    <span class="author-name"
                                        >{photo.username}</span
                                    >
                                    <span class="photo-date">
                                        {new Date(
                                            photo.createdAt,
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            {#if isOwner}
                                <div class="owner-actions">
                                    <button
                                        class="btn btn-small btn-secondary"
                                        onclick={startEdit}
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        class="btn btn-small btn-danger"
                                        onclick={handleDelete}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            {/if}
                        {/if}
                    </div>

                    <div class="comments-section">
                        <h3 class="comments-title">
                            Comments ({photo.comments.length})
                        </h3>

                        <div class="comments-list">
                            {#each photo.comments as comment (comment.id)}
                                <div class="comment">
                                    <div class="comment-header">
                                        <strong>{comment.username}</strong>
                                        <span class="comment-date">
                                            {new Date(
                                                comment.createdAt,
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                    <p class="comment-content">
                                        {comment.content}
                                    </p>
                                </div>
                            {:else}
                                <p class="no-comments">
                                    No comments yet. Be the first to comment!
                                </p>
                            {/each}
                        </div>

                        <div class="comment-form">
                            <textarea
                                bind:value={commentText}
                                placeholder="Add a comment..."
                                rows="3"
                                class="comment-input"
                            ></textarea>
                            <button
                                class="btn btn-primary"
                                onclick={handleAddComment}
                                disabled={!commentText.trim()}
                            >
                                Post Comment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
        overflow-y: auto;
    }

    .modal-content {
        background: white;
        border-radius: 16px;
        max-width: 1200px;
        width: 100%;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        position: relative;
        overflow: hidden;
    }

    .close-button {
        position: absolute;
        top: 16px;
        right: 16px;
        background: rgba(0, 0, 0, 0.5);
        color: white;
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        font-size: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        transition: background 0.2s;
    }

    .close-button:hover {
        background: rgba(0, 0, 0, 0.7);
    }

    .modal-body {
        display: grid;
        grid-template-columns: 1fr 400px;
        height: 100%;
        overflow: hidden;
    }

    .modal-left {
        background: #000;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }

    .modal-image {
        max-width: 100%;
        max-height: 90vh;
        object-fit: contain;
    }

    .modal-right {
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        background: white;
    }

    .photo-header {
        padding: 24px;
        border-bottom: 1px solid #e0e0e0;
    }

    .photo-title-large {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 700;
        color: #1a1a1a;
    }

    .photo-description {
        margin: 0 0 16px 0;
        color: #666;
        line-height: 1.5;
    }

    .photo-author-info {
        display: flex;
        gap: 12px;
        align-items: center;
        font-size: 14px;
    }

    .author-name {
        font-weight: 600;
        color: #1a1a1a;
    }

    .photo-date {
        color: #999;
    }

    .owner-actions {
        margin-top: 16px;
        display: flex;
        gap: 8px;
    }

    .edit-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        font-family: inherit;
        margin-bottom: 12px;
    }

    .title-input {
        font-size: 18px;
        font-weight: 600;
    }

    .description-input {
        resize: vertical;
        font-family: inherit;
    }

    .edit-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
    }

    .comments-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 24px;
        overflow-y: auto;
    }

    .comments-title {
        margin: 0 0 16px 0;
        font-size: 18px;
        font-weight: 600;
        color: #1a1a1a;
    }

    .comments-list {
        flex: 1;
        margin-bottom: 20px;
        overflow-y: auto;
    }

    .comment {
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;
    }

    .comment:last-child {
        border-bottom: none;
    }

    .comment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
        gap: 8px;
    }

    .comment-header strong {
        color: #1a1a1a;
        font-size: 14px;
    }

    .comment-date {
        font-size: 12px;
        color: #999;
        white-space: nowrap;
    }

    .comment-content {
        margin: 0;
        color: #333;
        line-height: 1.5;
        font-size: 14px;
        word-wrap: break-word;
    }

    .no-comments {
        text-align: center;
        color: #999;
        padding: 40px 20px;
        font-style: italic;
    }

    .comment-form {
        border-top: 1px solid #e0e0e0;
        padding-top: 16px;
    }

    .comment-input {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        font-family: inherit;
        resize: vertical;
        margin-bottom: 12px;
    }

    .comment-input:focus {
        outline: none;
        border-color: #0066cc;
    }

    .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn-primary {
        background: #0066cc;
        color: white;
        width: 100%;
    }

    .btn-primary:hover:not(:disabled) {
        background: #0052a3;
    }

    .btn-secondary {
        background: #f0f0f0;
        color: #333;
    }

    .btn-secondary:hover {
        background: #e0e0e0;
    }

    .btn-danger {
        background: #ff4444;
        color: white;
    }

    .btn-danger:hover {
        background: #cc0000;
    }

    .btn-small {
        padding: 6px 12px;
        font-size: 13px;
    }

    @media (max-width: 900px) {
        .modal-body {
            grid-template-columns: 1fr;
        }

        .modal-left {
            max-height: 400px;
        }

        .modal-right {
            max-height: none;
        }
    }

    @media (max-width: 600px) {
        .modal-backdrop {
            padding: 0;
        }

        .modal-content {
            max-height: 100vh;
            border-radius: 0;
        }

        .photo-header {
            padding: 16px;
        }

        .comments-section {
            padding: 16px;
        }
    }
</style>
