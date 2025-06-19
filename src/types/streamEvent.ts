
export type StreamEvent = {
	id?: number;
	streamDate: string;
	login: string;
	created_at: Date;
	eventType: string;
	message?: string;
};
