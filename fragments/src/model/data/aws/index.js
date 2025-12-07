// src/model/data/aws/index.js

const s3Client = require('./s3Client');
const {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const logger = require('../../../logger');

// XXX: temporary use of memory-db until we add DynamoDB
const MemoryDB = require('../memory/memory-db');

// Helper to convert stream to buffer
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

/**
 * DATA FUNCTIONS – use S3 for the actual bytes
 */

// Write fragment data to S3
async function writeFragmentData(ownerId, id, data) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
    Body: data,
  };

  const command = new PutObjectCommand(params);

  try {
    await s3Client.send(command);
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error uploading fragment data to S3');
    throw new Error('unable to upload fragment data');
  }
}

// Read fragment data from S3
async function readFragmentData(ownerId, id) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  const command = new GetObjectCommand(params);

  try {
    const data = await s3Client.send(command);
    return streamToBuffer(data.Body);
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error streaming fragment data from S3');
    throw new Error('unable to read fragment data');
  }
}

// Delete fragment data from S3 and metadata from MemoryDB
async function deleteFragment(ownerId, id) {
  // 1) delete S3 object
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  const command = new DeleteObjectCommand(params);

  try {
    await s3Client.send(command);
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error deleting fragment data from S3');
    throw new Error('unable to delete fragment data');
  }

  // 2) delete from MemoryDB (metadata + in-memory data map)
  return MemoryDB.deleteFragment(ownerId, id);
}

/**
 * Export the AWS data model:
 * - All metadata ops come from MemoryDB
 * - Only data ops (write/read/delete) use S3
 */
module.exports = {
  writeFragment: MemoryDB.writeFragment,
  readFragment: MemoryDB.readFragment,
  listFragments: MemoryDB.listFragments,
  writeFragmentData,
  readFragmentData,
  deleteFragment,
};
