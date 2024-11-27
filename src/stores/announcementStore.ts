import { BotEvents } from "../botEvents";
import EventBus from "../eventBus";
import Supabase from "../integrations/supabase";
import { Announcement } from "../types/announcement";

export abstract class AnnouncementStore {

	static announcements: Announcement[] = [];

	public static getAnnouncement = (command: string): Announcement | undefined => this.announcements.find(ann => ann.command === command);

	public static getAnnouncements = (): Announcement[] => {
		return this.announcements;
	}

	public static loadAnnouncements = async (): Promise<void> => {
		this.announcements = (await Supabase.getAnnouncements() as Announcement[] || []);
		EventBus.eventEmitter.emit(BotEvents.LoadAnnouncements, this.announcements);
	}
}
