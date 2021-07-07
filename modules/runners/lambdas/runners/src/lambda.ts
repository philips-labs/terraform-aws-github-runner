import { scaleUp } from './scale-runners/scale-up';
import { scaleDown } from './scale-runners/scale-down';
import { SQSEvent, ScheduledEvent, Context } from 'aws-lambda';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
module.exports.scaleUp = async (event: SQSEvent, context: Context, callback: any) => {
  console.dir(event, { depth: 5 });
  try {
    for (const e of event.Records) {
      await scaleUp(e.eventSource, JSON.parse(e.body));
    }
    return callback(null);
  } catch (e) {
    console.error(e);
    return callback('Failed handling SQS event');
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
module.exports.scaleDown = async (event: ScheduledEvent, context: Context, callback: any) => {
  try {
    scaleDown();
    return callback(null);
  } catch (e) {
    console.error(e);
    return callback('Failed');
  }
};
