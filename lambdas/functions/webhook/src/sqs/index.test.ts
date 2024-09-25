import { SendMessageCommandInput } from '@aws-sdk/client-sqs';

import { GithubWorkflowEvent, sendActionRequest, sendWebhookEventToWorkflowJobQueue } from '.';
import workflowjob_event from '../../test/resources/github_workflowjob_event.json';
import { Config } from '../ConfigResolver';
import { getParameter } from '@aws-github-runner/aws-ssm-util';
import { mocked } from 'jest-mock';

const mockSQS = {
  sendMessage: jest.fn(() => {
    return {};
  }),
};
jest.mock('@aws-sdk/client-sqs', () => ({
  SQS: jest.fn().mockImplementation(() => mockSQS),
}));
jest.mock('@aws-github-runner/aws-ssm-util');

import { SQS } from '@aws-sdk/client-sqs';

describe('Test sending message to SQS.', () => {
  const queueUrl = 'https://sqs.eu-west-1.amazonaws.com/123456789/queued-builds';
  const message = {
    eventType: 'type',
    id: 0,
    installationId: 0,
    repositoryName: 'test',
    repositoryOwner: 'owner',
    queueId: queueUrl,
    repoOwnerType: 'Organization',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should queue a message', async () => {
    // Arrange
    const sqsMessage: SendMessageCommandInput = {
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(message),
    };
    // Act
    const result = await sendActionRequest(message);

    // Assert
    expect(mockSQS.sendMessage).toBeCalledWith(sqsMessage);
    expect(result).resolves;
  });
});

describe('Test sending message to SQS.', () => {
  const message: GithubWorkflowEvent = {
    workflowJobEvent: JSON.parse(JSON.stringify(workflowjob_event)),
  };
  const sqsMessage: SendMessageCommandInput = {
    QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/123456789/webhook_events_workflow_job_queue',
    MessageBody: JSON.stringify(message),
  };
  beforeEach(() => {
    const mockedGet = mocked(getParameter);
    mockedGet.mockResolvedValue('[]');
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('sends webhook events to workflow job queue', async () => {
    // Arrange
    process.env.SQS_WORKFLOW_JOB_QUEUE = sqsMessage.QueueUrl;
    const config = await Config.load();

    // Act
    const result = await sendWebhookEventToWorkflowJobQueue(message, config);

    // Assert
    expect(mockSQS.sendMessage).toHaveBeenCalledWith(sqsMessage);
    expect(result).resolves;
  });

  it('Does not send webhook events to workflow job event copy queue when job queue is not in environment', async () => {
    // Arrange
    delete process.env.SQS_WORKFLOW_JOB_QUEUE;
    const config = await Config.load();

    // Act
    await sendWebhookEventToWorkflowJobQueue(message, config);

    // Assert
    expect(SQS).not.toHaveBeenCalled();
  });

  // eslint-disable-next-line max-len
  it('Does not send webhook events to workflow job event copy queue when job queue is set to empty string', async () => {
    // Arrange
    process.env.SQS_WORKFLOW_JOB_QUEUE = '';
    const config = await Config.load();
    // Act
    await sendWebhookEventToWorkflowJobQueue(message, config);

    // Assert
    expect(SQS).not.toHaveBeenCalled();
  });

  it('Catch the exception when even copy queue throws exception', async () => {
    // Arrange
    process.env.SQS_WORKFLOW_JOB_QUEUE = sqsMessage.QueueUrl;
    const config = await Config.load();

    const mockSQS = {
      sendMessage: jest.fn(() => {
        throw new Error();
      }),
    };
    jest.mock('aws-sdk', () => ({
      SQS: jest.fn().mockImplementation(() => mockSQS),
    }));
    await expect(sendWebhookEventToWorkflowJobQueue(message, config)).resolves.not.toThrow();
  });
});
