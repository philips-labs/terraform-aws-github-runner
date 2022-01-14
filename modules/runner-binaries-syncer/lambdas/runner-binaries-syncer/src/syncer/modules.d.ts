import { LogLevel, LogType } from './logger';

declare namespace NodeJS {
  export interface ProcessEnv {
    LOG_LEVEL: LogLevel;
    LOG_TYPE: LogType;
  }
}
