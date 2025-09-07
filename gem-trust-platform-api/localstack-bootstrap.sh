#!/usr/bin/env bash
set -euo pipefail

# Simple bootstrap script to create local resources on LocalStack

AWS="aws --endpoint-url http://localhost:4566 --region us-east-1"

STACK_NAME=${STACK_NAME:-gem-trust-platform-api}
USERS_TABLE=${USERS_TABLE:-${STACK_NAME}-users}
DOC_BUCKET=${DOC_BUCKET:-${STACK_NAME}-documents-000000000000}
USER_POOL_NAME=${USER_POOL_NAME:-${STACK_NAME}-user-pool}

echo "Creating DynamoDB table: ${USERS_TABLE}"
${AWS} dynamodb create-table \
  --table-name "${USERS_TABLE}" \
  --billing-mode PAY_PER_REQUEST \
  --attribute-definitions AttributeName=userId,AttributeType=S AttributeName=GSI1PK,AttributeType=S AttributeName=GSI1SK,AttributeType=S AttributeName=GSI2PK,AttributeType=S AttributeName=GSI2SK,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH \
  --global-secondary-indexes '[]' || true

echo "Creating S3 bucket: ${DOC_BUCKET}"
${AWS} s3api create-bucket --bucket "${DOC_BUCKET}" || true

echo "Creating Cognito User Pool"
USER_POOL_ID=$(${AWS} cognito-idp create-user-pool --pool-name "${USER_POOL_NAME}" --query 'UserPool.Id' --output text || true)
echo "USER_POOL_ID=${USER_POOL_ID}"

echo "Creating Cognito User Pool Client"
CLIENT_ID=$(${AWS} cognito-idp create-user-pool-client --user-pool-id "${USER_POOL_ID}" --client-name "${STACK_NAME}-client" --no-generate-secret --query 'UserPoolClient.ClientId' --output text || true)
echo "CLIENT_ID=${CLIENT_ID}"

echo "Creating Cognito groups"
${AWS} cognito-idp create-group --user-pool-id "${USER_POOL_ID}" --group-name Buyers || true
${AWS} cognito-idp create-group --user-pool-id "${USER_POOL_ID}" --group-name Sellers || true

cat <<EOF

Local outputs:
  ApiGatewayUrl: http://localhost:4566/restapis/<api-id>/prod/_user_request_
  UserPoolId: ${USER_POOL_ID}
  UserPoolClientId: ${CLIENT_ID}
  UsersTableName: ${USERS_TABLE}
  DocumentsBucketName: ${DOC_BUCKET}

Set frontend .env.local with:
  NEXT_PUBLIC_COGNITO_USER_POOL_ID=${USER_POOL_ID}
  NEXT_PUBLIC_COGNITO_CLIENT_ID=${CLIENT_ID}
  NEXT_PUBLIC_AWS_REGION=us-east-1
  NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:4566/restapis/<api-id>/prod/_user_request_
EOF


