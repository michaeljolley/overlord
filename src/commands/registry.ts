import { Command } from '../types/command.js';
import { OnCommandEvent } from '../types/onCommandEvent.js';
import { BotEvents } from '../botEvents.js';
import EventBus from '../eventBus.js';
import { blog, bluesky, discord, github, help, instagram, mute, powertoys, say, shop, tiktok, twitter, unmute, uses, youtube } from '../integrations/twitch/commands/index.js';

const commands: Record<string, { command: Command, public: boolean }> = {};

export function loadCommands(): void {
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

export function getCommand(commandName: string): Command | undefined {
  return commands[commandName]?.command;
}

export function getCommands(): Record<string, { command: Command, public: boolean }> {
  return commands;
}

export function handleCommand(onCommandEvent: OnCommandEvent, announcements?: any[]): void {
  const command = getCommand(onCommandEvent.command);
  if (command) {
    command.command(onCommandEvent);
    EventBus.eventEmitter.emit(BotEvents.OnCommand, { username: onCommandEvent.user, command: onCommandEvent.command, message: onCommandEvent.message });
    return;
  }

  if (onCommandEvent.command === 'help') {
    help(onCommandEvent, commands);
    EventBus.eventEmitter.emit(BotEvents.OnCommand, { username: onCommandEvent.user, command: onCommandEvent.command, message: onCommandEvent.message });
    return;
  }

  if (announcements) {
    const announcement = announcements.find(a => a.command === onCommandEvent.command);
    if (announcement) {
      onCommandEvent.message = announcement.message!;
      say(onCommandEvent);
      EventBus.eventEmitter.emit(BotEvents.OnCommand, { username: onCommandEvent.user, command: onCommandEvent.command, message: onCommandEvent.message });
    }
  }
}
