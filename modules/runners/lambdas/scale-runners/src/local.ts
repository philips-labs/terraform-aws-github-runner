import express from 'express';
import bodyParser from 'body-parser';
import { handle, ActionRequestMessage } from './scale-runners/handler';

const app = express();

app.use(bodyParser.json());

app.post('/event_handler', (req, res) => {
  handle('aws:sqs', JSON.parse(req.body) as ActionRequestMessage)
    .then()
    .catch((e) => {
      console.log(e);
      res.status(404);
    });
});

app.listen(3000, (): void => {
  console.log('webhook app listening on port 3000!');
});
