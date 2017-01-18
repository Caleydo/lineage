import {create} from '../src/app';

describe('create', () => {
  it('is method', () => {
    expect(typeof create).toEqual('function');
  });
});
