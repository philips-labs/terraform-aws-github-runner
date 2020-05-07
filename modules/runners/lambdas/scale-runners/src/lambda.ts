import { handle } from './scale-runners/handler';
import { SQSEvent } from 'aws-lambda';

module.exports.handler = async (event: SQSEvent, context: any, callback: any) => {
  console.log(event);
  try {
    for (const e of event.Records) {
      await handle(e.eventSource, JSON.parse(e.body));
    }
    return callback(null);
  } catch (e) {
    console.error(e);
    return callback('Failed handling SQS event');
  }
};
