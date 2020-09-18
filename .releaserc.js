module.exports = {
  branches: ['master', 'add-semantic-release'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    '@semantic-release/git',
    [
      '@semantic-release/github',
      {
        assets: [
          {
            path:
              'modules/runner-binaries-syncer/lambdas/runner-binaries-syncer/runner-binaries-syncer.zip',
            name: 'runner-binaries-syncer-${nextRelease.gitTag}.zip',
            label: 'Module - Runner binaries syncer',
          },
          {
            path: 'modules/runners/lambdas/runners/runners.zip',
            name: 'runners-${nextRelease.gitTag}.zip',
            label: 'Module - Scale runners',
          },
          {
            path: 'modules/webhook/lambdas/webhook/webhook.zip',
            name: 'webhook-${nextRelease.gitTag}.zip',
            label: 'Module - GitHub App web hook',
          },
        ],
      },
    ],
  ],
};
