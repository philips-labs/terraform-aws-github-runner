import { handle } from './cleanup-runners/handler';

module.exports.handler = async (event: any, context: any, callback: any) => {
  const statusCode = await handle();
  return callback();
};
