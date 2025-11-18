// fragments/src/model/fragment.js

const crypto = require('crypto');
const data = require('./data');

const SUPPORTED_TYPES = ['application/json'];

const isSupportedType = (value) => {
  if (!value) {
    return false;
  }
  const type = value.toLowerCase();
  return type.startsWith('text/') || SUPPORTED_TYPES.includes(type);
};

const now = () => new Date().toISOString();

class Fragment {
  constructor({ id, ownerId, type, created = now(), updated = created, size = 0 }) {
    if (!ownerId) {
      throw new Error('ownerId is required');
    }
    if (!type || !isSupportedType(type)) {
      throw new Error('type is required and must be supported');
    }

    this.id = id || crypto.randomUUID();
    this.ownerId = ownerId;
    this.type = type.toLowerCase();
    this.created = created;
    this.updated = updated;
    this.size = size;
  }

  static isSupportedType(type) {
    return isSupportedType(type);
  }

  static async byUser(ownerId, expand = false) {
    const fragments = await data.listFragments(ownerId);
    if (expand) {
      return fragments.map((fragment) => new Fragment(fragment).toObject());
    }
    return fragments.map((fragment) => fragment.id);
  }

  static async byId(ownerId, id) {
    const fragment = await data.readFragment(ownerId, id);
    return fragment ? new Fragment(fragment) : undefined;
  }

  static async delete(ownerId, id) {
    await data.deleteFragment(ownerId, id);
    await data.deleteFragmentData(ownerId, id);
  }

  async save() {
    this.updated = now();
    await data.writeFragment(this.toObject());
  }

  async setData(buffer) {
    if (!Buffer.isBuffer(buffer)) {
      throw new Error('data must be a Buffer');
    }
    this.size = buffer.length;
    this.updated = now();
    await data.writeFragment(this.toObject());
    await data.writeFragmentData(this.ownerId, this.id, buffer);
  }

  async getData() {
    return data.readFragmentData(this.ownerId, this.id);
  }

  toObject() {
    return {
      id: this.id,
      ownerId: this.ownerId,
      type: this.type,
      created: this.created,
      updated: this.updated,
      size: this.size,
    };
  }

  toJSON() {
    return this.toObject();
  }
}

module.exports = Fragment;
