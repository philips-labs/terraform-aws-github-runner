import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';
import { AppAuth } from '@octokit/auth-app/dist-types/types';
import { listRunners, terminateRunner, RunnerInfo } from './runners';
import { createGithubAppAuth, createInstallationClient } from './scale-up';

// function createGithubAppAuth(installationId: number | undefined): AppAuth {
//   const privateKey = Buffer.from(process.env.GITHUB_APP_KEY_BASE64 as string, 'base64').toString();
//   const appId: number = parseInt(process.env.GITHUB_APP_ID as string);
//   const clientId = process.env.GITHUB_APP_CLIENT_ID as string;
//   const clientSecret = process.env.GITHUB_APP_CLIENT_SECRET as string;

//   return createAppAuth({
//     id: appId,
//     privateKey: privateKey,
//     installationId: installationId,
//     clientId: clientId,
//     clientSecret: clientSecret,
//   });
// }

// async function createInstallationClient(githubAppAuth: AppAuth): Promise<Octokit> {
//   const auth = await githubAppAuth({ type: 'installation' });
//   return new Octokit({ auth: auth.token });
// }

// specific to scale down
async function createAppClient(githubAppAuth: AppAuth): Promise<Octokit> {
  const auth = await githubAppAuth({ type: 'app' });
  return new Octokit({ auth: auth.token });
}

interface Repo {
  isOrg: boolean;
  repoName: string;
  repoOwner: string;
}

function getRepo(runner: RunnerInfo): Repo {
  if (runner.repo) {
    return {
      repoOwner: runner.repo?.split('/')[0] as string,
      repoName: runner.repo?.split('/')[1] as string,
      isOrg: false,
    };
  } else {
    return {
      repoOwner: runner.org as string,
      repoName: '',
      isOrg: true,
    };
  }
}

async function createGitHubClientForRunner(runner: RunnerInfo): Promise<Octokit> {
  const githubClient = await createAppClient(createGithubAppAuth(undefined));
  const repo = getRepo(runner);

  const repoInstallationId = repo.isOrg
    ? (
        await githubClient.apps.getOrgInstallation({
          org: repo.repoOwner,
        })
      ).data.id
    : (
        await githubClient.apps.getRepoInstallation({
          owner: repo.repoOwner,
          repo: repo.repoName,
        })
      ).data.id;

  return createInstallationClient(createGithubAppAuth(repoInstallationId));
}

export async function scaleDown(): Promise<void> {
  const environment = process.env.ENVIRONMENT as string;
  const runners = await listRunners({
    environment: environment,
  });

  if (runners?.length === 0) {
    console.debug(`No active runners found for environment: '${environment}'`);
    return;
  }

  runners.forEach(async (r) => {
    const githubAppClient = await createGitHubClientForRunner(r);

    const repo = getRepo(r);
    const registered = await githubAppClient.actions.listSelfHostedRunnersForRepo({
      owner: repo.repoOwner,
      repo: repo.repoName,
    });

    console.log(registered.data.runners);
    registered.data.runners.forEach(async (a: any) => {
      const runnerName = a.name as string;
      if (runnerName === r.instanceId) {
        console.log(r.instanceId);
        try {
          const result = repo.isOrg
            ? await githubAppClient.actions.deleteSelfHostedRunnerFromOrg({ runner_id: a.id, org: repo.repoOwner })
            : await githubAppClient.actions.deleteSelfHostedRunnerFromRepo({
                runner_id: a.id,
                owner: repo.repoOwner,
                repo: repo.repoName,
              });
          if (result?.status == 204) {
            terminateRunner(r);
            console.info(
              `AWS runner instance '${r.instanceId}' is terminated and GitHub runner '${runnerName}' is de-registered.`,
            );
          }
          console.info(
            `AWS runner instance '${r.instanceId}' is terminated and GitHub runner '${runnerName}' is de-registered.`,
          );
        } catch (e) {
          console.debug(`Runner '${runnerName}' cannot be de-registered, most likely the runner is active.`);
        }
      }
    });
  });
}
