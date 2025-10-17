<script lang="ts">
    import { onMount } from "svelte";
    import PhotoCard from "$lib/components/PhotoCard.svelte";
    import PhotoModal from "$lib/components/PhotoModal.svelte";
    import UploadForm from "$lib/components/UploadForm.svelte";
    import UserMenu from "$lib/components/UserMenu.svelte";
    import { photosStore } from "$lib/stores/photos";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    let showUploadForm = $state(false);
    let loadMoreTrigger: HTMLDivElement;
    let observer: IntersectionObserver;

    const state = $derived($photosStore);

    onMount(() => {
        // Load initial photos
        photosStore.loadPhotos(true);

        // Set up intersection observer for infinite scrolling
        observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting && !state.loading && state.hasMore) {
                    photosStore.loadPhotos();
                }
            },
            {
                rootMargin: "200px",
            },
        );

        if (loadMoreTrigger) {
            observer.observe(loadMoreTrigger);
        }

        return () => {
            if (observer) {
                observer.disconnect();
            }
        };
    });

    function handlePhotoClick(photo: (typeof state.photos)[0]) {
        photosStore.openModal(photo);
    }

    function handleUploadSuccess() {
        showUploadForm = false;
    }
</script>

<svelte:head>
    <title>Photo Sharing App</title>
    <meta name="description" content="Share and discover amazing photos" />
</svelte:head>

<div class="app">
    <header class="header">
        <div class="container header-content">
            <div class="header-text">
                <h1 class="app-title">📸 Photo Gallery</h1>
                <p class="app-subtitle">Share your moments with the world</p>
            </div>
            {#if data.user}
                <UserMenu user={data.user} />
            {/if}
        </div>
    </header>

    <main class="main">
        <div class="container">
            <div class="upload-section">
                <button
                    class="toggle-upload-button"
                    onclick={() => (showUploadForm = !showUploadForm)}
                >
                    {showUploadForm ? "✕ Close" : "➕ Upload New Photo"}
                </button>

                {#if showUploadForm}
                    <div class="upload-form-container">
                        <UploadForm onSuccess={handleUploadSuccess} />
                    </div>
                {/if}
            </div>

            {#if state.photos.length === 0 && !state.loading}
                <div class="empty-state">
                    <p class="empty-icon">📷</p>
                    <h2>No photos yet</h2>
                    <p>Be the first to upload a photo!</p>
                </div>
            {:else}
                <div class="photo-grid">
                    {#each state.photos as photo (photo.id)}
                        <PhotoCard
                            {photo}
                            onclick={() => handlePhotoClick(photo)}
                        />
                    {/each}
                </div>

                {#if state.loading}
                    <div class="loading">
                        <div class="spinner"></div>
                        <p>Loading more photos...</p>
                    </div>
                {/if}

                {#if !state.hasMore && state.photos.length > 0}
                    <div class="end-message">
                        <p>🎉 You've reached the end!</p>
                    </div>
                {/if}
            {/if}

            <div bind:this={loadMoreTrigger} class="load-trigger"></div>
        </div>
    </main>

    {#if state.selectedPhoto}
        <PhotoModal
            photo={state.selectedPhoto}
            isOpen={state.isModalOpen}
            onClose={() => photosStore.closeModal()}
        />
    {/if}
</div>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Oxygen, Ubuntu, Cantarell, sans-serif;
        background: #f5f5f5;
        color: #1a1a1a;
    }

    :global(*) {
        box-sizing: border-box;
    }

    .app {
        min-height: 100vh;
    }

    .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 48px 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
    }

    .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 24px;
    }

    .header-text {
        flex: 1;
    }

    .app-title {
        margin: 0 0 8px 0;
        font-size: 42px;
        font-weight: 800;
        text-align: center;
    }

    .app-subtitle {
        margin: 0;
        font-size: 18px;
        text-align: center;
        opacity: 0.95;
    }

    .main {
        padding: 32px 0 64px;
    }

    .upload-section {
        margin-bottom: 32px;
    }

    .toggle-upload-button {
        width: 100%;
        padding: 16px 24px;
        background: #0066cc;
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 2px 8px rgba(0, 102, 204, 0.3);
    }

    .toggle-upload-button:hover {
        background: #0052a3;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 102, 204, 0.4);
    }

    .upload-form-container {
        margin-top: 16px;
        animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .photo-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 24px;
        margin-bottom: 32px;
    }

    .empty-state {
        text-align: center;
        padding: 80px 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .empty-icon {
        font-size: 64px;
        margin: 0 0 16px 0;
    }

    .empty-state h2 {
        margin: 0 0 8px 0;
        font-size: 28px;
        color: #1a1a1a;
    }

    .empty-state p {
        margin: 0;
        font-size: 16px;
        color: #666;
    }

    .loading {
        text-align: center;
        padding: 40px 20px;
    }

    .spinner {
        width: 40px;
        height: 40px;
        margin: 0 auto 16px;
        border: 4px solid #f0f0f0;
        border-top: 4px solid #0066cc;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    .loading p {
        margin: 0;
        color: #666;
        font-size: 14px;
    }

    .end-message {
        text-align: center;
        padding: 32px 20px;
        color: #666;
        font-size: 16px;
    }

    .end-message p {
        margin: 0;
    }

    .load-trigger {
        height: 20px;
        visibility: hidden;
    }

    @media (max-width: 768px) {
        .header {
            padding: 32px 20px;
        }

        .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
        }

        .app-title {
            font-size: 32px;
        }

        .app-subtitle {
            font-size: 16px;
        }

        .photo-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 16px;
        }

        .main {
            padding: 24px 0 48px;
        }
    }

    @media (max-width: 480px) {
        .photo-grid {
            grid-template-columns: 1fr;
        }

        .container {
            padding: 0 16px;
        }
    }
</style>
