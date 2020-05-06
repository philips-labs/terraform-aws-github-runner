import { handle } from './scale-runners/handler';

module.exports.handler = async (event: any, context: any, callback: any) => {
  try {
    await handle(event.eventSource, JSON.parse(event.body));
    return callback(null);
  } catch (e) {
    console.error(e);
    return callback('Failed handling SQS event');
  }
};
