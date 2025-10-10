// fragments/src/model/data/memory/memory-db.js

const fragments = new Map();
const fragmentData = new Map();

const clone = (value) => (value ? { ...value } : value);

const getOwnerFragments = (ownerId, create = false) => {
  if (!fragments.has(ownerId)) {
    if (!create) {
      return undefined;
    }
    fragments.set(ownerId, new Map());
  }
  return fragments.get(ownerId);
};

const getOwnerData = (ownerId, create = false) => {
  if (!fragmentData.has(ownerId)) {
    if (!create) {
      return undefined;
    }
    fragmentData.set(ownerId, new Map());
  }
  return fragmentData.get(ownerId);
};

async function writeFragment(fragment) {
  if (!fragment || !fragment.id || !fragment.ownerId) {
    throw new Error('fragment, fragment.id, and fragment.ownerId are required');
  }
  const ownerFragments = getOwnerFragments(fragment.ownerId, true);
  ownerFragments.set(fragment.id, clone(fragment));
}

async function readFragment(ownerId, id) {
  const ownerFragments = getOwnerFragments(ownerId);
  if (!ownerFragments) {
    return undefined;
  }
  return clone(ownerFragments.get(id));
}

async function listFragments(ownerId) {
  const ownerFragments = getOwnerFragments(ownerId);
  if (!ownerFragments) {
    return [];
  }
  return Array.from(ownerFragments.values()).map((fragment) => clone(fragment));
}

async function deleteFragment(ownerId, id) {
  const ownerFragments = getOwnerFragments(ownerId);
  const ownerData = getOwnerData(ownerId);
  if (!ownerFragments) {
    return;
  }
  ownerFragments.delete(id);
  if (ownerData) {
    ownerData.delete(id);
  }
}

async function writeFragmentData(ownerId, id, data) {
  if (!Buffer.isBuffer(data)) {
    throw new Error('data must be a Buffer');
  }
  const ownerData = getOwnerData(ownerId, true);
  ownerData.set(id, Buffer.from(data));
}

async function readFragmentData(ownerId, id) {
  const ownerData = getOwnerData(ownerId);
  if (!ownerData) {
    return undefined;
  }
  const value = ownerData.get(id);
  return value ? Buffer.from(value) : undefined;
}

async function deleteFragmentData(ownerId, id) {
  const ownerData = getOwnerData(ownerId);
  if (!ownerData) {
    return;
  }
  ownerData.delete(id);
}

function reset() {
  fragments.clear();
  fragmentData.clear();
}

module.exports = {
  writeFragment,
  readFragment,
  listFragments,
  deleteFragment,
  writeFragmentData,
  readFragmentData,
  deleteFragmentData,
  reset,
};
