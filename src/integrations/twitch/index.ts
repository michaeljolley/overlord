import ComfyJS, { EmoteSet, OnCommandExtra, OnMessageExtra, OnMessageFlags, OnSubGiftExtra, SubMethods } from 'comfy.js'
import EventBus from "../../eventBus";
import {
	blog,
  bluesky,
	discord,
	github,
	help,
	instagram,
	mute,
  powertoys,
  say,
	shop,
	tiktok,
	twitter,
	unmute,
	uses,
	youtube
} from './commands';
import { Command } from '../../types/command';
import { OnCommandEvent } from '../../types/onCommandEvent';
import { StreamUser } from '../../types/streamUser';
import { OnChatMessageEvent } from '../../types/onChatMessageEvent';
import { BotEvents } from '../../botEvents';
import sanitizeHtml from 'sanitize-html';
import { UserStore } from '../../stores/userStore';
import { AnnouncementStore } from '../../stores/announcementStore';
import { Announcement } from '../../types/announcement';
import { blazor } from './triggers';
import Supabase from '../supabase';
import { Replacement } from '../../types/replacement';

const TWITCH_BOT_USERNAME = process.env.TWITCH_BOT_USERNAME!;
const TWITCH_BOT_AUTH_TOKEN = process.env.TWITCH_BOT_AUTH_TOKEN;
const TWITCH_CHANNEL = process.env.TWITCH_CHANNEL!;

export default function twitchChat() {

	const commands: Record<string, { command: Command, public: boolean }> = {};
	const triggers: { name: string, trigger: (onChatMessageEvent: OnChatMessageEvent) => void}[] = [];
	let announcements: Announcement[] = [];
	let replacements: Replacement[] = [];
  
	const loadCommands = () => {
    commands['blog'] = { command: new Command('blog', blog), public: true };
    commands['bluesky'] = { command: new Command('bluesky', bluesky), public: true };
    commands['discord'] = { command: new Command('discord', discord), public: true };
    commands['github'] = { command: new Command('github', github), public: true };
    commands['instagram'] = { command: new Command('instagram', instagram), public: true };
    commands['mute'] = { command: new Command('mute', mute), public: false };
    commands['powertoys'] = { command: new Command('powertoys', powertoys), public: true };
    commands['shop'] = { command: new Command('shop', shop), public: true };
    commands['tiktok'] = { command: new Command('tiktok', tiktok), public: true };
    commands['twitter'] = { command: new Command('twitter', twitter), public: true };
    commands['unmute'] = { command: new Command('unmute', unmute), public: false };
    commands['uses'] = { command: new Command('uses', uses), public: true };
    commands['youtube'] = { command: new Command('youtube', youtube), public: true };
	}

	const loadTriggers = () => {
		triggers.push({ name: 'blazor', trigger: blazor });
	}

  const loadAnnouncements = async () => {
    let newAnnouncements = AnnouncementStore.getAnnouncements();
    announcements = newAnnouncements.filter(a => a.command && a.message);
  }

  const loadReplacements = async () => {
    let newReplacements = await Supabase.getReplacements();
    replacements = newReplacements.filter(r => r.fromWord && r.toWord);
  }
	
	const emit = (eventType: string, payload: any) => {
		EventBus.eventEmitter.emit(eventType, payload);
	}

  const sendToChat = (message: string) => {
    ComfyJS.Say(message, TWITCH_CHANNEL);
  }
	
  const getCommand = (commandName: string): Command | undefined => {
		return commands[commandName]?.command;
  }

	const handleCommand = (onCommandEvent: OnCommandEvent) => {
		const command: Command | undefined = getCommand(onCommandEvent.command);
    if (command) {
      command.command(onCommandEvent);
      return;
    }

		if (onCommandEvent.command === 'help') {
			help(onCommandEvent, commands);
			return;
		}

    const announcement = announcements.find(a => a.command === onCommandEvent.command);
    if (announcement) {
      onCommandEvent.message = announcement.message!;
      say(onCommandEvent);
    }
	}

	const handleTriggers = (onChatMessageEvent: OnChatMessageEvent) => {
    const message = onChatMessageEvent.message.toLocaleLowerCase();
    
		triggers.forEach(trigger => {
			if (message.includes(trigger.name)) {
				trigger.trigger(onChatMessageEvent);
			}
		});
	}

	const handleChat = async (user: string, message: string, flags: OnMessageFlags, self: boolean, extra: OnMessageExtra) => {
		user = user.toLocaleLowerCase();

    if (
			!self
      && 
			user !== TWITCH_BOT_USERNAME.toLocaleLowerCase()
      && user !== TWITCH_CHANNEL.toLocaleLowerCase()
		) {

      let userInfo: StreamUser | null;

			userInfo = await UserStore.getUser(user)

      if (userInfo) {
        const processedChatMessage = processChat(message, flags, extra.messageEmotes);
        if (processedChatMessage.length > 0) {
					const onChatMessageEvent = new OnChatMessageEvent(userInfo, message, processedChatMessage, flags, self, extra, extra.id)

          emit(BotEvents.OnChatMessage, onChatMessageEvent)

					handleTriggers(onChatMessageEvent)
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

		for (const replacement of replacements) {
			let msg = tempMessage.toLocaleLowerCase();

			var index = msg.indexOf(replacement.fromWord.toLocaleLowerCase());

			if (index !== -1) {
				tempMessage = tempMessage.slice(0, index) +
					replacement.toWord +
					tempMessage.slice(index + replacement.fromWord.length);
			}
		}

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

	const onSubGift  = (
			gifterUser: string,
			streakMonths: number,
			recipientUser: string,
			senderCount: number,
			subTierInfo: SubMethods,
			extra: OnSubGiftExtra
		) => {
			   emit(BotEvents.OnSubGifted, { username: recipientUser });
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
	loadTriggers();
  loadAnnouncements();
	loadReplacements();

	EventBus.eventEmitter.on(BotEvents.OnSay, (payload: { message: string }) => {
		sendToChat(payload.message);
	});
  EventBus.eventEmitter.on(BotEvents.LoadAnnouncements, loadAnnouncements);
	
  ComfyJS.Init(TWITCH_BOT_USERNAME, TWITCH_BOT_AUTH_TOKEN, TWITCH_CHANNEL);
	ComfyJS.onCommand = onCommand;
	ComfyJS.onChat = onChat;
	ComfyJS.onSubGift = onSubGift;
}
