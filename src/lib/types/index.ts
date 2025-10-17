export interface User {
	id: string;
	username: string;
	avatar?: string;
}

export interface Comment {
	id: string;
	photoId: string;
	userId: string;
	username: string;
	content: string;
	createdAt: string;
}

export interface Photo {
	id: string;
	userId: string;
	username: string;
	imageUrl: string;
	title: string;
	description?: string;
	createdAt: string;
	comments: Comment[];
}

export interface PhotoUpload {
	title: string;
	description?: string;
	imageFile: File;
}
