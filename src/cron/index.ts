import { CronJob } from "cron";
import { BotEvents } from "../botEvents";
import EventBus from "../eventBus";
import { AnnouncementStore } from "../stores/announcementStore";
import { Announcement } from "../types/announcement";

export default async function cron() {
  let announcements: Announcement[] = [];
  let queue: Announcement[] = [];
  
  const announcementCronJob = new CronJob('*/20 * * * * *', function () {
    if (queue.length === 0) {
      queue = [...announcements];
    }

    const announcement = queue.shift();

    if (announcement) {
      EventBus.eventEmitter.emit(BotEvents.Announcement, announcement);
    }
  }, null, true, 'America/Chicago');

  const loadAnnouncements = async () => {
    announcements = AnnouncementStore.getAnnouncements();
    queue = [];
  }

  loadAnnouncements();

  announcementCronJob.start();

  EventBus.eventEmitter.on(BotEvents.LoadAnnouncements, loadAnnouncements);

  await AnnouncementStore.loadAnnouncements();
}
