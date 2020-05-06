import { ActionRequestMessage, handle } from './handler';

import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';

jest.mock('@octokit/auth-app', () => ({
  createAppAuth: jest.fn().mockImplementation(() => jest.fn().mockImplementation(() => ({ token: 'Blaat' }))),
}));
const mockOctokit = { checks: { get: jest.fn() }, actions: { listRepoWorkflowRuns: jest.fn() } };
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => mockOctokit),
}));

const TEST_DATA: ActionRequestMessage = {
  id: 1,
  eventType: 'check_run',
  repositoryName: 'hello-world',
  repositoryOwner: 'Codertocat',
  installationId: 2,
};

describe('handler', () => {
  beforeEach(() => {
    process.env.GITHUB_APP_KEY = 'TEST_CERTIFICATE_DATA';
    process.env.GITHUB_APP_ID = '1337';
    process.env.GITHUB_APP_CLIENT_ID = 'TEST_CLIENT_ID';
    process.env.GITHUB_APP_CLIENT_SECRET = 'TEST_CLIENT_SECRET';
    jest.clearAllMocks();
    mockOctokit.actions.listRepoWorkflowRuns.mockImplementation(() => ({
      total_count: 1,
    }));
  });

  it('ignores non-sqs events', async () => {
    expect.assertions(1);
    expect(handle('aws:s3', TEST_DATA)).rejects.toEqual(Error('Cannot handle non-SQS events!'));
  });

  it('checks queued workflows', async () => {
    await handle('aws:sqs', TEST_DATA);
    expect(mockOctokit.actions.listRepoWorkflowRuns).toBeCalledWith({
      owner: TEST_DATA.repositoryOwner,
      repo: TEST_DATA.repositoryName,
      status: 'queued',
    });
  });
});
