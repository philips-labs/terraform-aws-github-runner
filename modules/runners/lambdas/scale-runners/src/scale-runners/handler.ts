import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';

export interface ActionRequestMessage {
  id: number;
  eventType: string;
  repositoryName: string;
  repositoryOwner: string;
  installationId: number;
}

async function createGithubClient(installationId: number): Promise<Octokit> {
  const privateKey = process.env.GITHUB_APP_KEY as string;
  const appId: number = parseInt(process.env.GITHUB_APP_ID as string);
  const clientId = process.env.GITHUB_APP_CLIENT_ID as string;
  const clientSecret = process.env.GITHUB_APP_CLIENT_SECRET as string;

  try {
    const auth = createAppAuth({
      id: appId,
      privateKey: privateKey,
      installationId: installationId,
      clientId: clientId,
      clientSecret: clientSecret,
    });
    const installationAuthentication = await auth({ type: 'installation' });

    return new Octokit({
      auth: installationAuthentication.token,
    });
  } catch (e) {
    Promise.reject(e);
  }
}

export const handle = async (eventSource: string, payload: ActionRequestMessage): Promise<void> => {
  if (eventSource !== 'aws:sqs') throw Error('Cannot handle non-SQS events!');
  const githubClient = await createGithubClient(payload.installationId);
  const queuedWorkflows = await githubClient.actions.listRepoWorkflowRuns({
    owner: payload.repositoryOwner,
    repo: payload.repositoryName,
    // @ts-ignore (typing is incorrect)
    status: 'queued',
  });
  console.info(
    `Repo ${payload.repositoryOwner}/${payload.repositoryName} has ${queuedWorkflows.total_count} queued workflow runs`,
  );
};
