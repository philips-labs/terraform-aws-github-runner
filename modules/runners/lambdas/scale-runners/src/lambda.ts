import { handle } from './scale-runners/handler';

module.exports.handler = async (event: any, context: any, callback: any) => {
  const statusCode = await handle(event.headers, event.body);
  return callback(null, {
    statusCode: statusCode,
  });
};
