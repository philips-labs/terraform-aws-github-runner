import { Octokit } from '@octokit/rest';
import { request } from '@octokit/request';
import { createAppAuth } from '@octokit/auth-app';
import { StrategyOptions, AppAuthentication } from '@octokit/auth-app/dist-types/types';
import { OctokitOptions } from '@octokit/core/dist-types/types';
import { getParameterValue } from './ssm';

export async function createOctoClient(token: string, ghesApiUrl = ''): Promise<Octokit> {
  const ocktokitOptions: OctokitOptions = {
    auth: token,
  };
  if (ghesApiUrl) {
    ocktokitOptions.baseUrl = ghesApiUrl;
    ocktokitOptions.previews = ['antiope'];
  }
  return new Octokit(ocktokitOptions);
}

export async function createGithubAuth(
  installationId: number | undefined,
  authType: 'app' | 'installation',
  ghesApiUrl = '',
): Promise<AppAuthentication> {
  const environment = process.env.ENVIRONMENT as string;

  let authOptions: StrategyOptions = {
    appId: parseInt(await getParameterValue(environment, 'github_app_id')),
    privateKey: Buffer.from(await getParameterValue(environment, 'github_app_key_base64'), 'base64').toString(),
    clientId: await getParameterValue(environment, 'github_app_client_id'),
    clientSecret: await getParameterValue(environment, 'github_app_client_secret'),
  };
  if (installationId) authOptions = { ...authOptions, installationId };

  console.debug(ghesApiUrl);
  if (ghesApiUrl) {
    authOptions.request = request.defaults({
      baseUrl: ghesApiUrl,
    });
  }
  const result = (await createAppAuth(authOptions)({ type: authType })) as AppAuthentication;
  return result;
}
