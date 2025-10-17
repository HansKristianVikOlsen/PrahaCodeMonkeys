// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: {
				id: string;
				username: string;
				email: string;
			} | null;
			sessionId: string | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module '$env/static/private' {
	export const AZURE_PHOTO_STORAGE_URL: string;
	export const AZURE_COMMENT_STORAGE_URL: string;
	export const AZURE_STORAGE_ACCOUNT: string;
	export const AZURE_PHOTO_CONTAINER: string;
	export const AZURE_COMMENT_CONTAINER: string;
	export const AZURE_AD_CLIENT_ID: string;
	export const AZURE_AD_CLIENT_SECRET: string;
	export const AZURE_AD_TENANT_ID: string;
	export const AZURE_AD_REDIRECT_URI: string;
}

export {};
