import {LogArea, LogLevel, log} from '@shared/log';

export async function onPart(user: string, self: boolean): Promise<void> {
  log(LogLevel.Info, LogArea.Chat, `onPart: ${user} (self: ${self})`)
}
