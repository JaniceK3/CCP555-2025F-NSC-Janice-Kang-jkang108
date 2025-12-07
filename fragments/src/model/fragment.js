// fragments/src/model/fragment.js

const crypto = require('crypto');
const {
  writeFragment,
  readFragment,
  listFragments,
  writeFragmentData,
  readFragmentData,
  deleteFragment,
} = require('./data');

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
    const fragments = await listFragments(ownerId, expand);
    if (expand) {
      return fragments.map((fragment) => new Fragment(fragment).toObject());
    }
    return fragments.map((fragment) => (typeof fragment === 'string' ? fragment : fragment.id));
  }

  static async byId(ownerId, id) {
    const fragment = await readFragment(ownerId, id);
    return fragment ? new Fragment(fragment) : undefined;
  }

  // (정적 delete는 data 레이어로 바로 위임만 해도 OK)
  static async delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  async save() {
    this.updated = now();
    await writeFragment(this.toObject());
  }

  async setData(buffer) {
    if (!Buffer.isBuffer(buffer)) {
      throw new Error('data must be a Buffer');
    }
    this.size = buffer.length;
    this.updated = now();

    // 실제 bytes 저장
    await writeFragmentData(this.ownerId, this.id, buffer);
    // 메타데이터 업데이트
    await this.save();
  }

  async getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  // 인스턴스 delete: 라우트에서 fragment.delete() 쓰는 패턴에 사용
  async delete() {
    return deleteFragment(this.ownerId, this.id);
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
