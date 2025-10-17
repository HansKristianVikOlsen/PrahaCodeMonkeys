<script>
	let photos = [
		{ id: 1, title: "Photo 1", metadata: "Size: 1024x768, Taken: 2024-01-01" },
		{ id: 2, title: "Photo 2", metadata: "Size: 800x600, Taken: 2024-02-10" },
		{ id: 3, title: "Photo 3", metadata: "Size: 1920x1080, Taken: 2024-03-15" }
	];

	let selectedPhoto = null;
	let newComment = "";
	let comments = {
		1: ["Nice!", "Amazing!"],
		2: ["Cool picture."],
		3: []
	};

	function openPhoto(photo) {
		selectedPhoto = photo;
	}

	function closePhoto() {
		selectedPhoto = null;
	}

	function addComment() {
		if (newComment.trim() !== "") {
			comments[selectedPhoto.id].push(newComment);
			newComment = "";
		}
	}
</script>

<style>
	.top-buttons {
		display: flex;
		gap: 1rem;
		padding: 1rem;
		background: #f0f0f0;
		border-radius: 8px;
		justify-content: center;
	}

	button {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 6px;
		background: #ddd;
		cursor: pointer;
		font-size: 1rem;
	}

	.gallery-grid {
		margin-top: 1rem;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 1rem;
		padding: 1rem;
	}

	.grid-item {
		border: 2px solid white;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		background: #eee;
		cursor: pointer;
	}

	/* Modal */
	.modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.modal-content {
		background: white;
		padding: 1.5rem;
		border-radius: 10px;
		width: 400px;
		max-height: 80vh;
		overflow-y: auto;
	}
</style>

<!-- Top Button Box -->
<div class="top-buttons">
	<button>Galleri</button>
	<button>Mine bilder</button>
	<button>Profil</button>
</div>

<!-- Grid Box -->
<div class="gallery-grid">
	{#each photos as photo}
		<div class="grid-item" on:click={() => openPhoto(photo)}>
			<!-- Placeholder SVG -->
			<svg width="50" height="50" viewBox="0 0 24 24">
				<circle cx="12" cy="12" r="10" stroke="black" stroke-width="2" fill="none"/>
				<line x1="8" y1="12" x2="16" y2="12" stroke="black" stroke-width="2"/>
			</svg>
		</div>
	{/each}
</div>

<!-- Modal for Photo View -->
{#if selectedPhoto}
	<div class="modal" on:click={closePhoto}>
		<div class="modal-content" on:click|stopPropagation>
			<h2>{selectedPhoto.title}</h2>

			<!-- Photo placeholder -->
			<svg width="100%" height="150" viewBox="0 0 24 24">
				<rect x="2" y="2" width="20" height="20" fill="#ccc" />
			</svg>

			<!-- Thumbs -->
			<div style="margin-top: 1rem; display: flex; gap: 1rem;">
				<button>👍</button>
				<button>👎</button>
			</div>

			<!-- Metadata -->
			<p style="margin-top: 1rem;"><strong>Metadata:</strong> {selectedPhoto.metadata}</p>

			<!-- Comments -->
			<h3>Comments</h3>
			{#each comments[selectedPhoto.id] as comment}
				<p>• {comment}</p>
			{/each}

			<input
				bind:value={newComment}
				placeholder="Add a comment..."
				style="width:100%; margin-top:0.5rem;"
			/>
			<button on:click={addComment} style="margin-top:0.5rem;">Add Comment</button>

			<button on:click={closePhoto} style="margin-top:1rem; width:100%;">Close</button>
		</div>
	</div>
{/if}
