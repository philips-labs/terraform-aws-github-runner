import { listRunners } from './runners';
import { handle } from './handler';
import { EC2 } from 'aws-sdk';

jest.mock('./handler');
const mockEC2 = { describeInstances: jest.fn() };
jest.mock('aws-sdk', () => ({
  EC2: jest.fn().mockImplementation(() => mockEC2),
}));

describe('list instances', () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });
  it('returns a list of instances', () => {
    listRunners();
  });
});
