import { handle } from './scale-down/handler';

handle().catch((e) => {
  console.log(e);
});
