import { LogType, LogLevel } from './logger';

declare namespace NodeJS {
  export interface ProcessEnv {
    LOG_LEVEL: LogLevel;
    LOG_TYPE: LogType;
  }
}
