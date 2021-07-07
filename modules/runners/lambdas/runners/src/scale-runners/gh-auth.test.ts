import { createOctoClient, createGithubAuth } from './gh-auth';
import nock from 'nock';
import { createAppAuth } from '@octokit/auth-app';
import { StrategyOptions } from '@octokit/auth-app/dist-types/types';
import { getParameterValue } from './ssm';
import { RequestInterface } from '@octokit/types';
import { mock, MockProxy } from 'jest-mock-extended';
import { request } from '@octokit/request';
import { mocked } from 'ts-jest/utils';

jest.mock('./ssm');
jest.mock('@octokit/auth-app');

const cleanEnv = process.env;
const ENVIRONMENT = 'dev';
const GITHUB_APP_ID = '1';
const GITHUB_APP_CLIENT_ID = '1';
const GITHUB_APP_CLIENT_SECRET = 'client_secret';

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  process.env = { ...cleanEnv };
  nock.disableNetConnect();
});

describe('Test createGithubAuth', () => {
  test('Creates app client to GitHub public', async () => {
    // Arrange
    const token = '123456';

    // Act
    const result = await createOctoClient(token);

    // Assert
    expect(result.request.endpoint.DEFAULTS.baseUrl).toBe('https://api.github.com');
  });

  test('Creates app client to GitHub ES', async () => {
    // Arrange
    const enterpriseServer = 'https://github.enterprise.notgoingtowork';
    const token = '123456';

    // Act
    const result = await createOctoClient(token, enterpriseServer);

    // Assert
    expect(result.request.endpoint.DEFAULTS.baseUrl).toBe(enterpriseServer);
    expect(result.request.endpoint.DEFAULTS.mediaType.previews).toStrictEqual(['antiope']);
  });
});

describe('Test createGithubAuth', () => {
  const mockedCreatAppAuth = createAppAuth as unknown as jest.Mock;
  const mockedDefaults = jest.spyOn(request, 'defaults');
  let mockedRequestInterface: MockProxy<RequestInterface>;

  const installationId = 1;
  const authType = 'app';
  const token = '123456';
  const decryptedValue = 'decryptedValue';
  const b64 = Buffer.from(decryptedValue, 'binary').toString('base64');

  beforeEach(() => {
    process.env.ENVIRONMENT = ENVIRONMENT;
  });

  test('Creates auth object for public GitHub', async () => {
    // Arrange
    const authOptions = {
      appId: parseInt(GITHUB_APP_ID),
      privateKey: decryptedValue,
      installationId,
      clientId: GITHUB_APP_CLIENT_ID,
      clientSecret: GITHUB_APP_CLIENT_SECRET,
    };

    const mockedGet = mocked(getParameterValue);
    mockedGet
      .mockResolvedValueOnce(GITHUB_APP_ID)
      .mockResolvedValueOnce(b64)
      .mockResolvedValueOnce(GITHUB_APP_CLIENT_ID)
      .mockResolvedValueOnce(GITHUB_APP_CLIENT_SECRET);
    const mockedAuth = jest.fn();
    mockedAuth.mockResolvedValue({ token });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mockedCreatAppAuth.mockImplementation((authOptions: StrategyOptions) => {
      return mockedAuth;
    });

    // Act
    const result = await createGithubAuth(installationId, authType);

    // Assert
    expect(getParameterValue).toBeCalledWith(ENVIRONMENT, 'github_app_id');
    expect(getParameterValue).toBeCalledWith(ENVIRONMENT, 'github_app_key_base64');
    expect(getParameterValue).toBeCalledWith(ENVIRONMENT, 'github_app_client_id');
    expect(getParameterValue).toBeCalledWith(ENVIRONMENT, 'github_app_client_secret');

    expect(mockedCreatAppAuth).toBeCalledTimes(1);
    expect(mockedCreatAppAuth).toBeCalledWith(authOptions);
    expect(mockedAuth).toBeCalledWith({ type: authType });
    expect(result.token).toBe(token);
  });

  test('Creates auth object for Enterprise Server', async () => {
    // Arrange
    const githubServerUrl = 'https://github.enterprise.notgoingtowork';

    mockedRequestInterface = mock<RequestInterface>();
    mockedDefaults.mockImplementation(() => {
      return mockedRequestInterface.defaults({ baseUrl: githubServerUrl });
    });

    const authOptions = {
      appId: parseInt(GITHUB_APP_ID),
      privateKey: decryptedValue,
      installationId,
      clientId: GITHUB_APP_CLIENT_ID,
      clientSecret: GITHUB_APP_CLIENT_SECRET,
      request: mockedRequestInterface.defaults({ baseUrl: githubServerUrl }),
    };

    const mockedGet = mocked(getParameterValue);
    mockedGet
      .mockResolvedValueOnce(GITHUB_APP_ID)
      .mockResolvedValueOnce(b64)
      .mockResolvedValueOnce(GITHUB_APP_CLIENT_ID)
      .mockResolvedValueOnce(GITHUB_APP_CLIENT_SECRET);
    const mockedAuth = jest.fn();
    mockedAuth.mockResolvedValue({ token });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mockedCreatAppAuth.mockImplementation((authOptions: StrategyOptions) => {
      return mockedAuth;
    });

    // Act
    const result = await createGithubAuth(installationId, authType, githubServerUrl);

    // Assert
    expect(getParameterValue).toBeCalledWith(ENVIRONMENT, 'github_app_id');
    expect(getParameterValue).toBeCalledWith(ENVIRONMENT, 'github_app_key_base64');
    expect(getParameterValue).toBeCalledWith(ENVIRONMENT, 'github_app_client_id');
    expect(getParameterValue).toBeCalledWith(ENVIRONMENT, 'github_app_client_secret');

    expect(mockedCreatAppAuth).toBeCalledTimes(1);
    expect(mockedCreatAppAuth).toBeCalledWith(authOptions);
    expect(mockedAuth).toBeCalledWith({ type: authType });
    expect(result.token).toBe(token);
  });

  test('Creates auth object for Enterprise Server with no ID', async () => {
    // Arrange
    const githubServerUrl = 'https://github.enterprise.notgoingtowork';

    mockedRequestInterface = mock<RequestInterface>();
    mockedDefaults.mockImplementation(() => {
      return mockedRequestInterface.defaults({ baseUrl: githubServerUrl });
    });

    const installationId = undefined;

    const authOptions = {
      appId: parseInt(GITHUB_APP_ID),
      privateKey: decryptedValue,
      clientId: GITHUB_APP_CLIENT_ID,
      clientSecret: GITHUB_APP_CLIENT_SECRET,
      request: mockedRequestInterface.defaults({ baseUrl: githubServerUrl }),
    };

    const mockedGet = mocked(getParameterValue);
    mockedGet
      .mockResolvedValueOnce(GITHUB_APP_ID)
      .mockResolvedValueOnce(b64)
      .mockResolvedValueOnce(GITHUB_APP_CLIENT_ID)
      .mockResolvedValueOnce(GITHUB_APP_CLIENT_SECRET);
    const mockedAuth = jest.fn();
    mockedAuth.mockResolvedValue({ token });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mockedCreatAppAuth.mockImplementation((authOptions: StrategyOptions) => {
      return mockedAuth;
    });

    // Act
    const result = await createGithubAuth(installationId, authType, githubServerUrl);

    // Assert
    expect(getParameterValue).toBeCalledWith(ENVIRONMENT, 'github_app_id');
    expect(getParameterValue).toBeCalledWith(ENVIRONMENT, 'github_app_key_base64');
    expect(getParameterValue).toBeCalledWith(ENVIRONMENT, 'github_app_client_id');
    expect(getParameterValue).toBeCalledWith(ENVIRONMENT, 'github_app_client_secret');

    expect(mockedCreatAppAuth).toBeCalledTimes(1);
    expect(mockedCreatAppAuth).toBeCalledWith(authOptions);
    expect(mockedAuth).toBeCalledWith({ type: authType });
    expect(result.token).toBe(token);
  });
});
