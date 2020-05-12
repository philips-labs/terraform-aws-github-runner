import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';
import { AppAuth } from '@octokit/auth-app/dist-types/types';
import { listRunners, terminateRunner, RunnerInfo } from './runners';
import { createGithubAppAuth, createInstallationClient } from './scale-up';
import yn from 'yn';

async function createAppClient(githubAppAuth: AppAuth): Promise<Octokit> {
  const auth = await githubAppAuth({ type: 'app' });
  return new Octokit({ auth: auth.token });
}

interface Repo {
  repoName: string;
  repoOwner: string;
}

function getRepo(runner: RunnerInfo, orgLevel: boolean): Repo {
  if (orgLevel) {
    return {
      repoOwner: runner.org as string,
      repoName: '',
    };
  } else {
    return {
      repoOwner: runner.repo?.split('/')[0] as string,
      repoName: runner.repo?.split('/')[1] as string,
    };
  }
}

async function createGitHubClientForRunner(runner: RunnerInfo, orgLevel: boolean): Promise<Octokit> {
  const githubClient = await createAppClient(createGithubAppAuth(undefined));
  const repo = getRepo(runner, orgLevel);

  const installationId = orgLevel
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

  return createInstallationClient(createGithubAppAuth(installationId));
}

export async function scaleDown(): Promise<void> {
  const enableOrgLevel = yn(process.env.ENABLE_ORGANIZATION_RUNNERS, { default: true });
  const environment = process.env.ENVIRONMENT as string;
  const runners = await listRunners({
    environment: environment,
  });

  if (runners?.length === 0) {
    console.debug(`No active runners found for environment: '${environment}'`);
    return;
  }
  console.log(runners);

  for (const r of runners) {
    const githubAppClient = await createGitHubClientForRunner(r, enableOrgLevel);

    const repo = getRepo(r, enableOrgLevel);
    console.log(repo);
    const registered = enableOrgLevel
      ? await githubAppClient.actions.listSelfHostedRunnersForOrg({
          org: repo.repoOwner,
        })
      : await githubAppClient.actions.listSelfHostedRunnersForRepo({
          owner: repo.repoOwner,
          repo: repo.repoName,
        });
    console.log(registered);

    console.log(registered.data.runners);
    for (const a of registered.data.runners) {
      const runnerName = a.name as string;
      if (runnerName === r.instanceId) {
        try {
          const result = enableOrgLevel
            ? await githubAppClient.actions.deleteSelfHostedRunnerFromOrg({ runner_id: a.id, org: repo.repoOwner })
            : await githubAppClient.actions.deleteSelfHostedRunnerFromRepo({
                runner_id: a.id,
                owner: repo.repoOwner,
                repo: repo.repoName,
              });

          if (result?.status == 204) {
            await terminateRunner(r);
            console.info(
              `AWS runner instance '${r.instanceId}' is terminated and GitHub runner '${runnerName}' is de-registered.`,
            );
          }
        } catch (e) {
          console.debug(`Runner '${runnerName}' cannot be de-registered, most likely the runner is active.`);
        }
      }
    }
  }
}
