# Gem Trust Platform API - Authentication Setup Guide

This guide provides step-by-step instructions for setting up the AWS Cognito User Pool and IAM roles required for the Gem Trust Platform authentication system.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [AWS Cognito User Pool Setup](#aws-cognito-user-pool-setup)
3. [IAM Roles and Policies](#iam-roles-and-policies)
4. [Environment Variables](#environment-variables)
5. [Deployment](#deployment)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before setting up the authentication system, ensure you have:

- AWS CLI configured with appropriate permissions
- AWS SAM CLI installed
- Node.js 18+ installed
- Docker installed (for local development)
- An AWS account with sufficient permissions to create:
  - Cognito User Pools
  - DynamoDB tables
  - S3 buckets
  - Lambda functions
  - IAM roles and policies

## AWS Cognito User Pool Setup

### 1. Deploy the SAM Template

The SAM template automatically creates the Cognito User Pool with the following configuration:

```bash
cd gem-trust-platform-api
sam build
sam deploy --guided
```

### 2. Manual Cognito Setup (Alternative)

If you prefer to set up Cognito manually:

#### Create User Pool
```bash
aws cognito-idp create-user-pool \
  --pool-name "gem-trust-platform-user-pool" \
  --username-attributes email \
  --auto-verified-attributes email \
  --policies '{
    "PasswordPolicy": {
      "MinimumLength": 8,
      "RequireUppercase": true,
      "RequireLowercase": true,
      "RequireNumbers": true,
      "RequireSymbols": true
    }
  }' \
  --schema '[
    {
      "Name": "email",
      "AttributeDataType": "String",
      "Required": true,
      "Mutable": true
    },
    {
      "Name": "name",
      "AttributeDataType": "String",
      "Required": true,
      "Mutable": true
    },
    {
      "Name": "phone_number",
      "AttributeDataType": "String",
      "Required": true,
      "Mutable": true
    },
    {
      "Name": "nic_number",
      "AttributeDataType": "String",
      "Required": true,
      "Mutable": false
    },
    {
      "Name": "role",
      "AttributeDataType": "String",
      "Required": true,
      "Mutable": false
    }
  ]'
```

#### Create User Pool Client
```bash
aws cognito-idp create-user-pool-client \
  --user-pool-id <USER_POOL_ID> \
  --client-name "gem-trust-platform-client" \
  --no-generate-secret \
  --explicit-auth-flows ALLOW_USER_SRP_AUTH ALLOW_REFRESH_TOKEN_AUTH ALLOW_USER_PASSWORD_AUTH
```

#### Create User Groups
```bash
# Create Buyer group
aws cognito-idp create-group \
  --user-pool-id <USER_POOL_ID> \
  --group-name "Buyers" \
  --description "Users who buy gems"

# Create Seller group
aws cognito-idp create-group \
  --user-pool-id <USER_POOL_ID> \
  --group-name "Sellers" \
  --description "Users who sell gems"
```

## IAM Roles and Policies

### 1. Lambda Execution Role

The SAM template automatically creates the necessary IAM roles. The Lambda function requires the following permissions:

#### Cognito Permissions
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cognito-idp:AdminCreateUser",
        "cognito-idp:AdminSetUserPassword",
        "cognito-idp:AdminAddUserToGroup",
        "cognito-idp:AdminGetUser",
        "cognito-idp:ListUsers"
      ],
      "Resource": "arn:aws:cognito-idp:REGION:ACCOUNT:userpool/USER_POOL_ID"
    }
  ]
}
```

#### DynamoDB Permissions
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:REGION:ACCOUNT:table/USERS_TABLE",
        "arn:aws:dynamodb:REGION:ACCOUNT:table/USERS_TABLE/index/*"
      ]
    }
  ]
}
```

#### S3 Permissions
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::DOCUMENTS_BUCKET/*"
    }
  ]
}
```

### 2. Manual IAM Role Creation

If creating IAM roles manually:

```bash
# Create Lambda execution role
aws iam create-role \
  --role-name "GemTrustPlatform-LambdaRole" \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "lambda.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }'

# Attach policies
aws iam attach-role-policy \
  --role-name "GemTrustPlatform-LambdaRole" \
  --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"

# Create and attach custom policy
aws iam create-policy \
  --policy-name "GemTrustPlatform-CustomPolicy" \
  --policy-document file://custom-policy.json

aws iam attach-role-policy \
  --role-name "GemTrustPlatform-LambdaRole" \
  --policy-arn "arn:aws:iam::ACCOUNT:policy/GemTrustPlatform-CustomPolicy"
```

## Environment Variables

### Frontend Environment Variables

Create a `.env.local` file in the frontend directory:

```bash
# AWS Cognito Configuration
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_AWS_REGION=us-east-1

# API Gateway Configuration
NEXT_PUBLIC_API_GATEWAY_URL=https://api.gemtrust.com

# Cognito Domain (optional, for hosted UI)
NEXT_PUBLIC_COGNITO_DOMAIN=gemtrust.auth.us-east-1.amazoncognito.com

# Redirect URLs
NEXT_PUBLIC_REDIRECT_SIGN_IN=http://localhost:3000/auth/callback
NEXT_PUBLIC_REDIRECT_SIGN_OUT=http://localhost:3000/auth
```

### Backend Environment Variables

The SAM template automatically sets these environment variables for Lambda functions:

- `USER_POOL_ID`: Cognito User Pool ID
- `USERS_TABLE`: DynamoDB Users table name
- `S3_BUCKET`: S3 bucket for document storage
- `BUYER_GROUP`: Cognito group name for buyers
- `SELLER_GROUP`: Cognito group name for sellers

## Deployment

### 1. Build and Deploy with SAM

```bash
# Build the application
sam build

# Deploy with guided setup (first time)
sam deploy --guided

# Deploy updates
sam deploy
```

### 2. Get Deployment Outputs

After deployment, get the required values:

```bash
# Get stack outputs
aws cloudformation describe-stacks \
  --stack-name gem-trust-platform-api \
  --query 'Stacks[0].Outputs'
```

### 3. Update Frontend Configuration

Update your frontend environment variables with the deployment outputs:

```bash
# Get User Pool ID
USER_POOL_ID=$(aws cloudformation describe-stacks \
  --stack-name gem-trust-platform-api \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
  --output text)

# Get User Pool Client ID
CLIENT_ID=$(aws cloudformation describe-stacks \
  --stack-name gem-trust-platform-api \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' \
  --output text)

# Get API Gateway URL
API_URL=$(aws cloudformation describe-stacks \
  --stack-name gem-trust-platform-api \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' \
  --output text)
```

## Testing

### 1. Test User Registration

```bash
# Test the registration endpoint
curl -X POST https://YOUR_API_GATEWAY_URL/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "fullName": "Test User",
    "mobileNumber": "+1234567890",
    "nicNumber": "123456789V",
    "role": "Buyer"
  }'
```

### 2. Test Cognito User Creation

```bash
# List users in the User Pool
aws cognito-idp list-users \
  --user-pool-id YOUR_USER_POOL_ID
```

### 3. Test DynamoDB

```bash
# Scan the Users table
aws dynamodb scan \
  --table-name YOUR_USERS_TABLE
```

## Troubleshooting

### Common Issues

#### 1. Cognito User Pool Not Found
- Verify the User Pool ID is correct
- Check that the User Pool exists in the correct region
- Ensure the Lambda function has the correct permissions

#### 2. DynamoDB Access Denied
- Verify the Lambda execution role has DynamoDB permissions
- Check that the table name matches the environment variable
- Ensure the table exists in the correct region

#### 3. S3 Upload Failed
- Verify the S3 bucket exists and is accessible
- Check that the Lambda execution role has S3 permissions
- Ensure the bucket policy allows the Lambda function to upload

#### 4. User Registration Fails
- Check CloudWatch logs for detailed error messages
- Verify all required fields are provided
- Ensure the password meets the policy requirements

### Debugging Steps

1. **Check CloudWatch Logs**
   ```bash
   aws logs describe-log-groups --log-group-name-prefix /aws/lambda/gem-trust-platform
   ```

2. **Test Lambda Function Locally**
   ```bash
   sam local invoke RegisterUserFunction --event events/register-event.json
   ```

3. **Verify IAM Permissions**
   ```bash
   aws iam get-role --role-name YOUR_LAMBDA_ROLE_NAME
   ```

4. **Check API Gateway Logs**
   - Enable CloudWatch logging for API Gateway
   - Check the API Gateway console for request/response logs

### Security Considerations

1. **Environment Variables**
   - Never commit sensitive environment variables to version control
   - Use AWS Systems Manager Parameter Store for production secrets
   - Rotate API keys and secrets regularly

2. **IAM Permissions**
   - Follow the principle of least privilege
   - Regularly audit IAM roles and policies
   - Use IAM conditions to restrict access

3. **Cognito Security**
   - Enable MFA for production environments
   - Configure password policies according to your requirements
   - Monitor failed authentication attempts

4. **Data Protection**
   - Encrypt sensitive data in DynamoDB
   - Use S3 server-side encryption for document storage
   - Implement proper access controls

## Support

For additional support:

1. Check the AWS documentation for Cognito, DynamoDB, and Lambda
2. Review CloudWatch logs for detailed error messages
3. Test individual components in isolation
4. Use AWS X-Ray for distributed tracing

## Next Steps

After successful setup:

1. Configure the frontend to use the deployed API
2. Implement additional authentication features (MFA, social login)
3. Add user management and admin functions
4. Implement proper error handling and logging
5. Set up monitoring and alerting