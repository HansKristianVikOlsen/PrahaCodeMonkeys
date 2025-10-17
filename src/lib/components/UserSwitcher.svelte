<script lang="ts">
    import { user, switchUser } from "$lib/stores/user";
    import type { User } from "$lib/types";

    const users: User[] = [
        { id: "1", username: "alice", avatar: "👩" },
        { id: "2", username: "bob", avatar: "👨" },
        { id: "3", username: "charlie", avatar: "🧑" },
    ];

    const currentUser = $derived($user);

    function handleUserChange(newUser: User) {
        switchUser(newUser);
    }
</script>

<div class="user-switcher">
    <span class="label">Current User:</span>
    <div class="user-buttons">
        {#each users as u (u.id)}
            <button
                class="user-button"
                class:active={currentUser.id === u.id}
                onclick={() => handleUserChange(u)}
                aria-label={`Switch to ${u.username}`}
            >
                <span class="avatar">{u.avatar}</span>
                <span class="username">{u.username}</span>
            </button>
        {/each}
    </div>
</div>

<style>
    .user-switcher {
        background: white;
        border-radius: 12px;
        padding: 16px 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin-bottom: 24px;
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
    }

    .label {
        font-weight: 600;
        color: #333;
        font-size: 14px;
    }

    .user-buttons {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    .user-button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border: 2px solid #e0e0e0;
        background: white;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 14px;
    }

    .user-button:hover {
        border-color: #0066cc;
        background: #f0f7ff;
    }

    .user-button.active {
        border-color: #0066cc;
        background: #0066cc;
        color: white;
    }

    .avatar {
        font-size: 20px;
        line-height: 1;
    }

    .username {
        font-weight: 600;
    }

    @media (max-width: 600px) {
        .user-switcher {
            padding: 12px 16px;
        }

        .label {
            width: 100%;
            font-size: 13px;
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
