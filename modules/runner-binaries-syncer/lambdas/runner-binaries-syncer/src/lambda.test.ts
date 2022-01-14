import { mocked } from 'jest-mock';

import { handler } from './lambda';
import { sync } from './syncer/syncer';

jest.mock('./syncer/syncer');

describe('Test download sync wrapper.', () => {
  it('Test successful download.', async () => {
    const mock = mocked(sync);
    mock.mockImplementation(() => {
      return new Promise((resolve) => {
        resolve();
      });
    });
    await expect(handler({}, {})).resolves;
  });

  it('Test wrapper with returning an error. ', async () => {
    const mock = mocked(sync);
    mock.mockRejectedValue(new Error(''));

    await expect(handler({}, {})).resolves;
  });
});
