import { logger } from './syncer/logger';
import { sync } from './syncer/syncer';

sync()
  .then()
  .catch((e) => {
    if (e instanceof Error) {
      logger.error(e.message);
    }
    logger.trace(e);
  });
