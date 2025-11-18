// fragments/tests/unit/fragment.test.js

const Fragment = require('../../src/model/fragment');
const data = require('../../src/model/data');

const wait = async (ms = 25) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Fragment model', () => {
  const ownerId = 'owner-1';

  beforeEach(() => {
    data.reset();
  });

  describe('isSupportedType()', () => {
    test('accepts any text/* type and application/json regardless of case', () => {
      ['text/plain', 'TEXT/MARKDOWN', 'text/html', 'APPLICATION/JSON'].forEach((type) => {
        expect(Fragment.isSupportedType(type)).toBe(true);
      });
    });

    test('rejects unsupported media types', () => {
      ['image/png', 'application/xml', 'application/octet-stream'].forEach((type) => {
        expect(Fragment.isSupportedType(type)).toBe(false);
      });
    });
  });

  describe('constructor', () => {
    test('ownerId is required', () => {
      expect(() => new Fragment({ type: 'text/plain' })).toThrow(/ownerId/);
    });

    test('type is required and must be supported', () => {
      expect(() => new Fragment({ ownerId })).toThrow(/type/);
      expect(() => new Fragment({ ownerId, type: 'application/xml' })).toThrow(/supported/);
    });

    test('generates a uuid if id not provided', () => {
      const fragment = new Fragment({ ownerId, type: 'text/plain' });
      expect(fragment.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    test('uses supplied id when provided', () => {
      const fragment = new Fragment({ id: 'custom-id', ownerId, type: 'text/plain' });
      expect(fragment.id).toBe('custom-id');
    });

    test('creates ISO created/updated timestamps and default size 0', () => {
      const fragment = new Fragment({ ownerId, type: 'text/plain' });
      expect(Date.parse(fragment.created)).not.toBeNaN();
      expect(Date.parse(fragment.updated)).not.toBeNaN();
      expect(fragment.size).toBe(0);
    });
  });

  describe('persistence & data access', () => {
    test('save() persists metadata and can be retrieved with byId()', async () => {
      const fragment = new Fragment({ ownerId, type: 'text/plain' });
      await fragment.save();

      const stored = await Fragment.byId(ownerId, fragment.id);
      expect(stored).toBeDefined();
      expect(stored.toObject()).toMatchObject({
        id: fragment.id,
        ownerId,
        type: 'text/plain',
        size: 0,
      });
    });

    test('byId() returns undefined when missing', async () => {
      expect(await Fragment.byId(ownerId, 'missing')).toBeUndefined();
    });

    test('byUser() returns ids or expanded metadata', async () => {
      const fragment = new Fragment({ ownerId, type: 'text/plain' });
      await fragment.save();
      await fragment.setData(Buffer.from('data'));

      const ids = await Fragment.byUser(ownerId);
      expect(ids).toEqual([fragment.id]);

      const expanded = await Fragment.byUser(ownerId, true);
      expect(expanded[0]).toMatchObject({
        id: fragment.id,
        ownerId,
        type: 'text/plain',
        size: 4,
      });
    });

    test('save() bumps updated timestamp', async () => {
      const fragment = new Fragment({ ownerId, type: 'text/plain' });
      const initialUpdated = fragment.updated;
      await wait();
      await fragment.save();
      const stored = await Fragment.byId(ownerId, fragment.id);
      expect(Date.parse(stored.updated)).toBeGreaterThan(Date.parse(initialUpdated));
    });

    test('setData() requires a Buffer', async () => {
      const fragment = new Fragment({ ownerId, type: 'text/plain' });
      await expect(fragment.setData('not-a-buffer')).rejects.toThrow(/Buffer/);
    });

    test('setData() stores raw data, updates size and timestamp', async () => {
      const fragment = new Fragment({ ownerId, type: 'text/plain' });
      await fragment.save();
      const initialUpdated = fragment.updated;

      const body = Buffer.from('hello fragment');
      await wait();
      await fragment.setData(body);
      const stored = await Fragment.byId(ownerId, fragment.id);
      expect(stored.size).toBe(body.length);
      expect(Date.parse(stored.updated)).toBeGreaterThan(Date.parse(initialUpdated));
      expect((await stored.getData()).equals(body)).toBe(true);
    });

    test('delete() removes metadata and data', async () => {
      const fragment = new Fragment({ ownerId, type: 'text/plain' });
      await fragment.save();
      await fragment.setData(Buffer.from('to-delete'));

      await Fragment.delete(ownerId, fragment.id);
      expect(await Fragment.byId(ownerId, fragment.id)).toBeUndefined();
      expect(await Fragment.byUser(ownerId)).toEqual([]);
    });
  });
});
