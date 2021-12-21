import { Logger } from 'tslog';

export type LogType = 'json' | 'pretty' | 'hidden';
export type LogLevel = 'silly' | 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export const logger = new Logger({
  colorizePrettyLogs: false,
  displayInstanceName: false,
  minLevel: (process.env.LOG_LEVEL as LogLevel) || 'info',
  name: 'runner-binaries-syncer',
  overwriteConsole: true,
  type: (process.env.LOG_TYPE as LogType) || 'pretty',
});
