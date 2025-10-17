<script lang="ts">
    import { photosStore } from "$lib/stores/photos";

    interface Props {
        onSuccess?: () => void;
    }

    let { onSuccess }: Props = $props();

    let title = $state("");
    let description = $state("");
    let imageFile: File | null = $state(null);
    let previewUrl = $state("");
    let isUploading = $state(false);
    let fileInputElement: HTMLInputElement;

    function handleFileChange(e: Event) {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];

        if (file) {
            if (!file.type.startsWith("image/")) {
                alert("Please select an image file");
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                alert("File size must be less than 10MB");
                return;
            }

            imageFile = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                previewUrl = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    function clearFile() {
        imageFile = null;
        previewUrl = "";
        if (fileInputElement) {
            fileInputElement.value = "";
        }
    }

    async function handleSubmit() {
        if (!title.trim() || !imageFile) {
            alert("Please provide a title and select an image");
            return;
        }

        isUploading = true;

        const formData = new FormData();
        formData.append("title", title.trim());
        if (description.trim()) {
            formData.append("description", description.trim());
        }
        formData.append("image", imageFile);

        const success = await photosStore.addPhoto(formData);

        isUploading = false;

        if (success) {
            // Reset form
            title = "";
            description = "";
            clearFile();
            onSuccess?.();
        } else {
            alert("Failed to upload photo. Please try again.");
        }
    }
</script>

<div class="upload-form">
    <h2 class="form-title">Upload New Photo</h2>

    <div class="form-group">
        <label for="title" class="form-label">Title *</label>
        <input
            id="title"
            type="text"
            bind:value={title}
            placeholder="Enter a title for your photo"
            class="form-input"
            disabled={isUploading}
        />
    </div>

    <div class="form-group">
        <label for="description" class="form-label">Description</label>
        <textarea
            id="description"
            bind:value={description}
            placeholder="Add a description (optional)"
            rows="3"
            class="form-input"
            disabled={isUploading}
        ></textarea>
    </div>

    <div class="form-group">
        <label for="image" class="form-label">Image *</label>
        <input
            bind:this={fileInputElement}
            id="image"
            type="file"
            accept="image/*"
            onchange={handleFileChange}
            class="file-input"
            disabled={isUploading}
        />

        {#if previewUrl}
            <div class="preview-container">
                <img src={previewUrl} alt="Preview" class="preview-image" />
                <button
                    type="button"
                    class="remove-preview"
                    onclick={clearFile}
                    disabled={isUploading}
                    aria-label="Remove image"
                >
                    ✕
                </button>
            </div>
        {/if}
    </div>

    <button
        class="submit-button"
        onclick={handleSubmit}
        disabled={isUploading || !title.trim() || !imageFile}
    >
        {isUploading ? "Uploading..." : "Upload Photo"}
    </button>
</div>

<style>
    .upload-form {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin-bottom: 32px;
    }

    .form-title {
        margin: 0 0 24px 0;
        font-size: 24px;
        font-weight: 700;
        color: #1a1a1a;
    }

    .form-group {
        margin-bottom: 20px;
    }

    .form-label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #333;
        font-size: 14px;
    }

    .form-input {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        font-family: inherit;
        transition: border-color 0.2s;
        box-sizing: border-box;
    }

    .form-input:focus {
        outline: none;
        border-color: #0066cc;
    }

    .form-input:disabled {
        background: #f5f5f5;
        cursor: not-allowed;
    }

    textarea.form-input {
        resize: vertical;
        min-height: 80px;
    }

    .file-input {
        display: block;
        width: 100%;
        padding: 8px;
        font-size: 14px;
    }

    .file-input:disabled {
        cursor: not-allowed;
    }

    .preview-container {
        margin-top: 16px;
        position: relative;
        display: inline-block;
        max-width: 100%;
    }

    .preview-image {
        max-width: 100%;
        max-height: 300px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        display: block;
    }

    .remove-preview {
        position: absolute;
        top: 8px;
        right: 8px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        font-size: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
    }

    .remove-preview:hover:not(:disabled) {
        background: rgba(0, 0, 0, 0.9);
    }

    .remove-preview:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }

    .submit-button {
        width: 100%;
        padding: 14px 24px;
        background: #0066cc;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
    }

    .submit-button:hover:not(:disabled) {
        background: #0052a3;
    }

    .submit-button:disabled {
        background: #ccc;
        cursor: not-allowed;
    }

    @media (max-width: 600px) {
        .upload-form {
            padding: 16px;
        }

        .form-title {
            font-size: 20px;
        }
    }
</style>
