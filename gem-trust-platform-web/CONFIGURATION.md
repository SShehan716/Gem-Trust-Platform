# Frontend Configuration Guide

This guide explains how to configure the frontend application with the correct AWS Cognito and API Gateway settings.

## Environment Variables

Create a `.env.local` file in the `gem-trust-platform-web` directory with the following variables:

```bash
# AWS Cognito Configuration
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_AWS_REGION=us-east-1

# API Gateway Configuration
NEXT_PUBLIC_API_GATEWAY_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/Prod

# Cognito Domain (optional, for hosted UI)
NEXT_PUBLIC_COGNITO_DOMAIN=your-domain.auth.us-east-1.amazoncognito.com

# Redirect URLs
NEXT_PUBLIC_REDIRECT_SIGN_IN=http://localhost:3000/auth/callback
NEXT_PUBLIC_REDIRECT_SIGN_OUT=http://localhost:3000/auth
```

## Getting Configuration Values

After deploying the backend API, you can get the required values using the AWS CLI:

### 1. Get User Pool ID
```bash
aws cloudformation describe-stacks \
  --stack-name gem-trust-platform-api \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
  --output text
```

### 2. Get User Pool Client ID
```bash
aws cloudformation describe-stacks \
  --stack-name gem-trust-platform-api \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' \
  --output text
```

### 3. Get API Gateway URL
```bash
aws cloudformation describe-stacks \
  --stack-name gem-trust-platform-api \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' \
  --output text
```

### 4. Get Cognito Domain
```bash
aws cloudformation describe-stacks \
  --stack-name gem-trust-platform-api \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolDomain`].OutputValue' \
  --output text
```

## Production Configuration

For production deployment, update the redirect URLs:

```bash
NEXT_PUBLIC_REDIRECT_SIGN_IN=https://your-domain.com/auth/callback
NEXT_PUBLIC_REDIRECT_SIGN_OUT=https://your-domain.com/auth
```

## Security Notes

- Never commit the `.env.local` file to version control
- Use different User Pool IDs for development and production
- Ensure HTTPS is used for all production URLs
- Regularly rotate API keys and secrets
