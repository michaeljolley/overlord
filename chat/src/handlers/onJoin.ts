import {LogArea, LogLevel, log} from '@shared/log';

export async function onJoin(user: string, self: boolean): Promise<void> {
  log(LogLevel.Info, LogArea.Chat, `onJoin: ${user} (self: ${self})`)
}
