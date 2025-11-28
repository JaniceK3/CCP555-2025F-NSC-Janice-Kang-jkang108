#!/bin/sh

# Setup steps for working with LocalStack and DynamoDB local instead of real AWS.
# Assumes aws cli is installed and LocalStack and DynamoDB local are running.

echo "Setting AWS environment variables for LocalStack / DynamoDB Local"

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_SESSION_TOKEN=test
export AWS_DEFAULT_REGION=us-east-1

echo "AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID"
echo "AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY"
echo "AWS_SESSION_TOKEN=$AWS_SESSION_TOKEN"
echo "AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION"

# Wait for LocalStack S3 to be ready
echo "Waiting for LocalStack S3 to become available..."
until (curl --silent http://localhost:4566/_localstack/health | grep "\"s3\": \"\(running\|available\)\"" > /dev/null); do
  sleep 5
done
echo "LocalStack S3 is ready."

# Create S3 bucket 'fragments' in LocalStack
echo "Creating S3 bucket 'fragments' in LocalStack..."
aws --endpoint-url=http://localhost:4566 s3api create-bucket --bucket fragments || echo "Bucket may already exist."

# Create DynamoDB table 'fragments' in DynamoDB Local
echo "Creating DynamoDB table 'fragments' in DynamoDB Local..."
aws --endpoint-url=http://localhost:8000 dynamodb create-table \
  --table-name fragments \
  --attribute-definitions \
    AttributeName=ownerId,AttributeType=S \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=ownerId,KeyType=HASH \
    AttributeName=id,KeyType=RANGE \
  --provisioned-throughput \
    ReadCapacityUnits=10,WriteCapacityUnits=5 || echo "Table may already exist."

# Wait until table exists
echo "Waiting for DynamoDB table 'fragments' to exist..."
aws --endpoint-url=http://localhost:8000 dynamodb wait table-exists --table-name fragments

echo "Local AWS setup complete."
