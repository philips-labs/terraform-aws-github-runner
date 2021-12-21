import { sync } from './syncer/syncer';
import { logger } from './syncer/logger';

sync()
  .then()
  .catch((e) => {
    if (e instanceof Error) {
      logger.error(e.message);
    }
    logger.trace(e);
  });
