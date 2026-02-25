import { Platform } from './platform';

export type StreamEvent = {
	streamDate: string;
	login: string;
	created_at: Date;
	eventType: string;
	message?: string;
	quantity?: number;
	platform?: Platform;
};
