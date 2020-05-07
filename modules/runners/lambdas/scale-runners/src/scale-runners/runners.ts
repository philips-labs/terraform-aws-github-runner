import { EC2 } from 'aws-sdk';

export interface RunnerInfo {
  instanceId: string;
  launchTime: Date;
  repo: string;
  org: string;
}

const ec2 = new EC2();
export async function listRunners(
  repoName: string | undefined = undefined,
  orgName: string | undefined = undefined,
): Promise<RunnerInfo[]> {
  let filters = [
    { Name: 'tag:Application', Values: ['github-action-runner'] },
    { Name: 'instance-state-name', Values: ['running', 'pending'] },
  ];
  if (repoName !== undefined) {
    filters.push({ Name: 'tag:Repo', Values: [repoName] });
  }
  if (orgName !== undefined) {
    filters.push({ Name: 'tag:Org', Values: [orgName] });
  }
  const runningInstances = await ec2.describeInstances({ Filters: filters }).promise();
  return [{ instanceId: 'i-123', launchTime: new Date(), repo: 'bla', org: 'bla' }];
}
