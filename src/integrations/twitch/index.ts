import ComfyJS, { OnCommandExtra, OnMessageFlags } from 'comfy.js'
import EventBus from "../../eventBus";
import { Command, OnCommandEvent } from './types';
import {
	blog,
	discord,
	github,
	instagram,
	mute,
	shop,
	tiktok,
	tips,
	twitter,
	unmute,
	uses,
	youtube
} from './commands';

const TWITCH_BOT_USERNAME = process.env.PALLYGG_API_KEY!;
const TWITCH_BOT_AUTH_TOKEN = process.env.TWITCH_BOT_AUTH_TOKEN;
const TWITCH_CHANNEL = process.env.TWITCH_CHANNEL!;

export default function twitchChat() {

	const commands: Command[] = [];
  
	const loadCommands = () => {
    commands.push(new Command('blog', blog as unknown as (onCommandEvent: OnCommandEvent) => void));
    commands.push(new Command('discord', discord as unknown as (onCommandEvent: OnCommandEvent) => void));
    commands.push(new Command('github', github as unknown as (onCommandEvent: OnCommandEvent) => void));
    commands.push(new Command('instagram', instagram as unknown as (onCommandEvent: OnCommandEvent) => void));
    commands.push(new Command('mute', mute as unknown as (onCommandEvent: OnCommandEvent) => void));
    commands.push(new Command('shop', shop as unknown as (onCommandEvent: OnCommandEvent) => void));
    commands.push(new Command('tiktok', tiktok as unknown as (onCommandEvent: OnCommandEvent) => void));
    commands.push(new Command('tips', tips as unknown as (onCommandEvent: OnCommandEvent) => void));
    commands.push(new Command('twitter', twitter as unknown as (onCommandEvent: OnCommandEvent) => void));
    commands.push(new Command('unmute', unmute as unknown as (onCommandEvent: OnCommandEvent) => void));
    commands.push(new Command('uses', uses as unknown as (onCommandEvent: OnCommandEvent) => void));
    commands.push(new Command('youtube', youtube as unknown as (onCommandEvent: OnCommandEvent) => void));
	}
	
	const emit = (eventType: string, payload: any) => {
		EventBus.eventEmitter.emit(eventType, payload);
	}

  const say = (message: string) => {
    ComfyJS.Say(message, TWITCH_CHANNEL);
  }
	
  const getCommand = (commandName: string): Command | undefined => {
    return commands.find(f => f?.commandName === commandName);
  }

	const handleCommand = (onCommandEvent: OnCommandEvent) => {
		const command: Command | undefined = getCommand(onCommandEvent.command);
    if (command) {
      command.command(onCommandEvent);
    }
	}

	const onCommand = async (user: string, command: string, message: string, flags: OnMessageFlags, extra: OnCommandExtra) => {
		handleCommand(new OnCommandEvent(user, command, message, flags, extra));
  }

	loadCommands();
	
	EventBus.eventEmitter.on("stream:say", (payload: { message: string }) => {
		say(payload.message);
	});
	
  ComfyJS.Init(TWITCH_BOT_USERNAME, TWITCH_BOT_AUTH_TOKEN, TWITCH_CHANNEL);
	ComfyJS.onCommand = onCommand;
}
