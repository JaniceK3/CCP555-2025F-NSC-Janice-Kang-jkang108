// fragments/tests/unit/memory-db.test.js

const data = require('../../src/model/data');

const sampleFragment = () => ({
  id: 'fragment-id',
  ownerId: 'owner-123',
  type: 'text/plain',
  created: '2024-01-01T00:00:00.000Z',
  updated: '2024-01-01T00:00:00.000Z',
  size: 0,
});

describe('in-memory data store', () => {
  beforeEach(() => {
    data.reset();
  });

  test('writeFragment and readFragment persist metadata', async () => {
    const fragment = sampleFragment();
    await data.writeFragment(fragment);

    const read = await data.readFragment(fragment.ownerId, fragment.id);
    expect(read).toEqual(fragment);
    expect(read).not.toBe(fragment);
  });

  test('listFragments returns all fragment metadata for an owner', async () => {
    const first = sampleFragment();
    const second = { ...sampleFragment(), id: 'fragment-2' };

    await data.writeFragment(first);
    await data.writeFragment(second);

    const fragments = await data.listFragments(first.ownerId);
    expect(fragments).toHaveLength(2);
    expect(fragments.map((frag) => frag.id).sort()).toEqual(['fragment-2', 'fragment-id']);
  });

  test('writeFragmentData and readFragmentData persist raw buffers', async () => {
    const fragment = sampleFragment();
    await data.writeFragment(fragment);

    const buffer = Buffer.from('hello world');
    await data.writeFragmentData(fragment.ownerId, fragment.id, buffer);

    const stored = await data.readFragmentData(fragment.ownerId, fragment.id);
    expect(stored.equals(buffer)).toBe(true);
    expect(stored).not.toBe(buffer);
  });

  test('deleteFragment removes metadata and data', async () => {
    const fragment = sampleFragment();
    await data.writeFragment(fragment);
    await data.writeFragmentData(fragment.ownerId, fragment.id, Buffer.from('data'));

    await data.deleteFragment(fragment.ownerId, fragment.id);

    expect(await data.readFragment(fragment.ownerId, fragment.id)).toBeUndefined();
    expect(await data.readFragmentData(fragment.ownerId, fragment.id)).toBeUndefined();
  });

  test('deleteFragmentData removes stored buffer only', async () => {
    const fragment = sampleFragment();
    await data.writeFragment(fragment);
    await data.writeFragmentData(fragment.ownerId, fragment.id, Buffer.from('data'));

    await data.deleteFragmentData(fragment.ownerId, fragment.id);

    expect(await data.readFragment(fragment.ownerId, fragment.id)).toEqual(fragment);
    expect(await data.readFragmentData(fragment.ownerId, fragment.id)).toBeUndefined();
  });
});
