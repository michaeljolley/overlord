import ComfyJS, { EmoteSet, OnCommandExtra, OnMessageExtra, OnMessageFlags } from 'comfy.js'
import EventBus from "../../eventBus";
import {
	blog,
  bluesky,
	discord,
	github,
	instagram,
  music,
	mute,
  say,
	shop,
	todo,
	tiktok,
	tips,
	twitter,
	unmute,
	uses,
	youtube
} from './commands';
import { Command } from '../../types/command';
import { OnCommandEvent } from '../../types/onCommandEvent';
import { User } from '../../types/user';
import { OnChatMessageEvent } from '../../types/onChatMessageEvent';
import { BotEvents } from '../../botEvents';
import sanitizeHtml from 'sanitize-html';
import { UserStore } from '../../stores/userStore';
import { TaskStore } from '../../stores/taskStore';
import { AnnouncementStore } from '../../stores/announcementStore';
import { Announcement } from '../../types/announcement';
import Supabase from '../supabase';

const TWITCH_BOT_USERNAME = process.env.PALLYGG_API_KEY!;
const TWITCH_BOT_AUTH_TOKEN = process.env.TWITCH_BOT_AUTH_TOKEN;
const TWITCH_CHANNEL = process.env.TWITCH_CHANNEL!;

export default function twitchChat() {

	const commands: Command[] = [];
	let announcements: Announcement[] = [];
  
	const loadCommands = () => {
    commands.push(new Command('blog', blog));
    commands.push(new Command('bluesky', bluesky));
    commands.push(new Command('discord', discord));
    commands.push(new Command('github', github));
    commands.push(new Command('instagram', instagram));
    commands.push(new Command('music', music));
    commands.push(new Command('mute', mute));
    commands.push(new Command('shop', shop));
    commands.push(new Command('todo', todo));
    commands.push(new Command('tiktok', tiktok));
    commands.push(new Command('tips', tips));
    commands.push(new Command('twitter', twitter));
    commands.push(new Command('unmute', unmute));
    commands.push(new Command('uses', uses));
    commands.push(new Command('youtube', youtube)); 
	}

  const loadAnnouncements = async () => {
    let newAnnouncements = AnnouncementStore.getAnnouncements();
    announcements = newAnnouncements.filter(a => a.command && a.message);
  }
	
	const emit = (eventType: string, payload: any) => {
		EventBus.eventEmitter.emit(eventType, payload);
	}

  const sendToChat = (message: string) => {
    ComfyJS.Say(message, TWITCH_CHANNEL);
  }
	
  const getCommand = (commandName: string): Command | undefined => {
    return commands.find(f => f?.commandName === commandName);
  }

	const handleCommand = (onCommandEvent: OnCommandEvent) => {
		const command: Command | undefined = getCommand(onCommandEvent.command);
    if (command) {
      command.command(onCommandEvent);
      return;
    }

    const announcement = announcements.find(a => a.command === onCommandEvent.command);
    if (announcement) {
      onCommandEvent.message = announcement.message!;
      say(onCommandEvent);
    }
	}

	const handleChat = async (user: string, message: string, flags: OnMessageFlags, self: boolean, extra: OnMessageExtra) => {
		user = user.toLocaleLowerCase();

    if (
			!self
      && 
			user !== TWITCH_BOT_USERNAME.toLocaleLowerCase()
      && user !== TWITCH_CHANNEL.toLocaleLowerCase()
		) {

      let userInfo: User | undefined

			userInfo = await UserStore.getUser(user)

      if (userInfo) {
        const processedChatMessage = processChat(message, flags, extra.messageEmotes);
        if (processedChatMessage.length > 0) {
					const todoData = TaskStore.getUserTasks(userInfo.login);
          emit(BotEvents.OnChatMessage, new OnChatMessageEvent(userInfo, message, processedChatMessage, flags, self, extra, extra.id, todoData))
        }
      }
    }
	}

	const processChat = (message: string, flags: OnMessageFlags, messageEmotes?: EmoteSet) => {
    let tempMessage: string = message.replace(/<img/gi, '<DEL');

    const theme = (flags.vip || flags.highlighted) ? "light" : "dark";

    // If the message has emotes, modify message to include img tags to the emote
    if (messageEmotes) {
      const emoteSet: Emote[] = [];

      for (const emote of Object.keys(messageEmotes)) {
        const emoteLocations = messageEmotes[emote];
        emoteLocations.forEach(location => {
          emoteSet.push(generateEmote(emote, location, theme));
        });
      }

      // Order the emotes descending so we can iterate
      // through them with indexes
      emoteSet.sort((a, b) => {
        return b.end - a.end;
      });

      emoteSet.forEach(emote => {
        let emoteMessage = tempMessage.slice(0, emote.start);
        emoteMessage += emote.emoteImageTag;
        emoteMessage += tempMessage.slice(emote.end + 1, tempMessage.length);
        tempMessage = emoteMessage;
      });
    }

    tempMessage = sanitizeHtml(tempMessage, {
      allowedAttributes: {
        img: ['class',
          'src']
      },
      allowedTags: [
        'marquee',
        'em',
        'strong',
        'b',
        'i',
        'code',
        'strike',
        'blink',
        'img',
        'h1',
        'h2',
        'h3',
      ]
    });

    tempMessage = tempMessage.replace(/@(\w*)/gm, `<span>$&</span>`);
    return tempMessage;
  }

  const generateEmote = (emoteId: string, position: string, theme: string) => {
    const [start, end] = position.split('-').map(Number);

    return {
      emoteId,
      emoteImageTag: `<img class='emote' src='https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/${theme}/1.0'/>`,
      emoteUrl: `https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/${theme}/1.0`,
      start,
      end
    };
  }

	type Emote = ReturnType<typeof generateEmote>

	const onCommand = async (user: string, command: string, message: string, flags: OnMessageFlags, extra: OnCommandExtra) => {
		handleCommand(new OnCommandEvent(user, command, message, flags, extra));
  }

	const onChat = async (
    user: string,
    message: string,
    flags: OnMessageFlags,
    self: boolean,
    extra: OnMessageExtra
  ) => {
		handleChat(user, message, flags, self, extra);
  }

	loadCommands();
  loadAnnouncements();
	
	EventBus.eventEmitter.on(BotEvents.OnSay, (payload: { message: string }) => {
		sendToChat(payload.message);
	});
  EventBus.eventEmitter.on(BotEvents.LoadAnnouncements, loadAnnouncements);
	
  ComfyJS.Init(TWITCH_BOT_USERNAME, TWITCH_BOT_AUTH_TOKEN, TWITCH_CHANNEL);
	ComfyJS.onCommand = onCommand;
	ComfyJS.onChat = onChat;
}
