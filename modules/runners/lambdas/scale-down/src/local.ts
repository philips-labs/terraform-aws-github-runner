import { handle } from './cleanup-runners/handler';

handle().catch((e) => {
  console.log(e);
});
