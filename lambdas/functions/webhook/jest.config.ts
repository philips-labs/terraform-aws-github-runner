import type { Config } from 'jest';

import defaultConfig from '../../jest.base.config';

const config: Config = {
  ...defaultConfig,
  coverageThreshold: {
    global: {
      statements: 99.19,
      branches: 96.87,
      functions: 100,
      lines: 99.16,
    },
  },
};

export default config;
