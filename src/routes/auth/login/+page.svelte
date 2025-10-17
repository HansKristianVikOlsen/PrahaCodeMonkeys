<script lang="ts">
    import { onMount } from "svelte";

    let error = $state("");
    let loading = $state(false);

    onMount(() => {
        // Check for error in URL params
        const params = new URLSearchParams(window.location.search);
        const errorParam = params.get("error");
        if (errorParam) {
            error = decodeURIComponent(errorParam);
        }
    });

    async function handleLogin() {
        loading = true;
        error = "";

        try {
            // Redirect to the login endpoint which will redirect to Azure AD
            window.location.href = "/auth/login/redirect";
        } catch (err) {
            error = "Failed to initiate login. Please try again.";
            loading = false;
        }
    }
</script>

<svelte:head>
    <title>Login - Photo Sharing App</title>
</svelte:head>

<div class="login-container">
    <div class="login-card">
        <div class="logo">
            <span class="logo-icon">📸</span>
            <h1 class="logo-text">Photo Gallery</h1>
        </div>

        <div class="welcome">
            <h2>Welcome Back</h2>
            <p>Sign in with your Microsoft account to continue</p>
        </div>

        {#if error}
            <div class="error-message">
                <span class="error-icon">⚠️</span>
                <p>{error}</p>
            </div>
        {/if}

        <button class="login-button" onclick={handleLogin} disabled={loading}>
            {#if loading}
                <span class="spinner"></span>
                <span>Signing in...</span>
            {:else}
                <svg
                    class="microsoft-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 21 21"
                >
                    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                </svg>
                <span>Sign in with Microsoft</span>
            {/if}
        </button>

        <div class="info">
            <p>
                This app uses Azure Active Directory (Entra ID) for secure
                authentication.
            </p>
        </div>
    </div>
</div>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Oxygen, Ubuntu, Cantarell, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
    }

    .login-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    }

    .login-card {
        background: white;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        padding: 48px;
        max-width: 440px;
        width: 100%;
        animation: slideUp 0.5s ease-out;
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .logo {
        text-align: center;
        margin-bottom: 32px;
    }

    .logo-icon {
        font-size: 64px;
        display: block;
        margin-bottom: 12px;
    }

    .logo-text {
        margin: 0;
        font-size: 32px;
        font-weight: 800;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .welcome {
        text-align: center;
        margin-bottom: 32px;
    }

    .welcome h2 {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 700;
        color: #1a1a1a;
    }

    .welcome p {
        margin: 0;
        font-size: 14px;
        color: #666;
        line-height: 1.5;
    }

    .error-message {
        background: #fee;
        border: 1px solid #fcc;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 24px;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        animation: shake 0.4s ease-out;
    }

    @keyframes shake {
        0%,
        100% {
            transform: translateX(0);
        }
        25% {
            transform: translateX(-10px);
        }
        75% {
            transform: translateX(10px);
        }
    }

    .error-icon {
        font-size: 20px;
        flex-shrink: 0;
    }

    .error-message p {
        margin: 0;
        color: #c33;
        font-size: 14px;
        line-height: 1.5;
    }

    .login-button {
        width: 100%;
        padding: 16px 24px;
        background: #2f2f2f;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .login-button:hover:not(:disabled) {
        background: #1a1a1a;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .login-button:active:not(:disabled) {
        transform: translateY(0);
    }

    .login-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .microsoft-icon {
        width: 21px;
        height: 21px;
        flex-shrink: 0;
    }

    .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .info {
        margin-top: 32px;
        padding-top: 24px;
        border-top: 1px solid #e0e0e0;
        text-align: center;
    }

    .info p {
        margin: 0;
        font-size: 13px;
        color: #999;
        line-height: 1.5;
    }

    @media (max-width: 480px) {
        .login-card {
            padding: 32px 24px;
        }

        .logo-icon {
            font-size: 48px;
        }

        .logo-text {
            font-size: 28px;
        }

        .welcome h2 {
            font-size: 20px;
        }

        .welcome p {
            font-size: 13px;
        }
    }
</style>
