<script lang="ts">
    interface Props {
        user: {
            username: string;
            email: string;
        };
    }

    let { user }: Props = $props();

    let showMenu = $state(false);

    function toggleMenu() {
        showMenu = !showMenu;
    }

    function handleLogout() {
        window.location.href = "/auth/logout";
    }

    // Close menu when clicking outside
    function handleClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest(".user-menu")) {
            showMenu = false;
        }
    }
</script>

<svelte:window onclick={handleClickOutside} />

<div class="user-menu">
    <button class="user-button" onclick={toggleMenu} aria-label="User menu">
        <span class="avatar">👤</span>
        <span class="username">{user.username}</span>
        <span class="chevron" class:open={showMenu}>▼</span>
    </button>

    {#if showMenu}
        <div class="menu-dropdown">
            <div class="menu-header">
                <div class="user-info">
                    <div class="user-name">{user.username}</div>
                    <div class="user-email">{user.email}</div>
                </div>
            </div>
            <div class="menu-divider"></div>
            <button class="menu-item" onclick={handleLogout}>
                <span class="menu-icon">🚪</span>
                <span>Sign out</span>
            </button>
        </div>
    {/if}
</div>

<style>
    .user-menu {
        position: relative;
    }

    .user-button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        color: white;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 14px;
        font-weight: 500;
    }

    .user-button:hover {
        background: rgba(255, 255, 255, 0.25);
        border-color: rgba(255, 255, 255, 0.3);
    }

    .avatar {
        font-size: 20px;
        line-height: 1;
    }

    .username {
        font-weight: 600;
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .chevron {
        font-size: 10px;
        transition: transform 0.2s;
        margin-left: 4px;
    }

    .chevron.open {
        transform: rotate(180deg);
    }

    .menu-dropdown {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        min-width: 240px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        overflow: hidden;
        animation: slideDown 0.2s ease-out;
        z-index: 1000;
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .menu-header {
        padding: 16px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }

    .user-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .user-name {
        font-weight: 700;
        font-size: 16px;
    }

    .user-email {
        font-size: 13px;
        opacity: 0.9;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .menu-divider {
        height: 1px;
        background: #e0e0e0;
    }

    .menu-item {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: none;
        border: none;
        color: #333;
        cursor: pointer;
        transition: background 0.2s;
        font-size: 14px;
        font-weight: 500;
        text-align: left;
    }

    .menu-item:hover {
        background: #f5f5f5;
    }

    .menu-icon {
        font-size: 18px;
        line-height: 1;
    }

    @media (max-width: 600px) {
        .username {
            max-width: 100px;
        }

        .menu-dropdown {
            min-width: 200px;
        }

        .user-button {
            padding: 6px 12px;
            font-size: 13px;
        }

        .avatar {
            font-size: 18px;
        }
    }
</style>
