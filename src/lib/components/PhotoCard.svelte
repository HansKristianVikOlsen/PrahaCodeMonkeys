<script lang="ts">
	import type { Photo } from '$lib/types';

	interface Props {
		photo: Photo;
		onclick?: () => void;
	}

	let { photo, onclick }: Props = $props();
</script>

<button
	class="photo-card"
	onclick={() => onclick?.()}
	aria-label={`View ${photo.title} by ${photo.username}`}
>
	<div class="photo-image">
		<img src={photo.imageUrl} alt={photo.title} loading="lazy" />
	</div>
	<div class="photo-info">
		<h3 class="photo-title">{photo.title}</h3>
		<div class="photo-meta">
			<span class="photo-author">{photo.username}</span>
			{#if photo.comments.length > 0}
				<span class="photo-comments">💬 {photo.comments.length}</span>
			{/if}
		</div>
	</div>
</button>

<style>
	.photo-card {
		position: relative;
		background: white;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s, box-shadow 0.2s;
		cursor: pointer;
		border: none;
		padding: 0;
		width: 100%;
		text-align: left;
	}

	.photo-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
	}

	.photo-image {
		width: 100%;
		aspect-ratio: 4 / 3;
		overflow: hidden;
		background: #f0f0f0;
	}

	.photo-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.photo-info {
		padding: 12px 16px;
	}

	.photo-title {
		margin: 0 0 8px 0;
		font-size: 16px;
		font-weight: 600;
		color: #1a1a1a;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.photo-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 14px;
		color: #666;
	}

	.photo-author {
		font-weight: 500;
	}

	.photo-comments {
		display: flex;
		align-items: center;
		gap: 4px;
	}
</style>
