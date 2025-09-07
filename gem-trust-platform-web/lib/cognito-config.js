/**
 * AWS Cognito Configuration for Gem Trust Platform
 * 
 * This file contains the configuration for AWS Cognito User Pool
 * and API Gateway endpoints for authentication.
 */

export const cognitoConfig = {
  // AWS Cognito User Pool Configuration
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || 'us-east-1_XXXXXXXXX',
  userPoolWebClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
  
  // AWS Region
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  
  // API Gateway Configuration
  apiGatewayUrl: process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'https://api.gemtrust.com',
  
  // Cognito User Pool Domain (for hosted UI)
  domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || 'gemtrust.auth.us-east-1.amazoncognito.com',
  
  // Redirect URLs
  redirectSignIn: process.env.NEXT_PUBLIC_REDIRECT_SIGN_IN || 'http://localhost:3000/auth/callback',
  redirectSignOut: process.env.NEXT_PUBLIC_REDIRECT_SIGN_OUT || 'http://localhost:3000/auth',
  
  // OAuth Configuration
  oauth: {
    domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || 'gemtrust.auth.us-east-1.amazoncognito.com',
    scope: ['email', 'openid', 'profile'],
    redirectSignIn: process.env.NEXT_PUBLIC_REDIRECT_SIGN_IN || 'http://localhost:3000/auth/callback',
    redirectSignOut: process.env.NEXT_PUBLIC_REDIRECT_SIGN_OUT || 'http://localhost:3000/auth',
    responseType: 'code'
  },
  
  // Password Policy
  passwordPolicy: {
    minLength: 8,
    requireLowercase: true,
    requireUppercase: true,
    requireNumbers: true,
    requireSymbols: true
  },
  
  // User Attributes
  userAttributes: {
    email: 'email',
    name: 'name',
    phone_number: 'phone_number',
    'custom:nic_number': 'custom:nic_number',
    'custom:role': 'custom:role'
  }
};

// Validation function for configuration
export const validateCognitoConfig = () => {
  const required = ['userPoolId', 'userPoolWebClientId', 'region'];
  const missing = required.filter(key => !cognitoConfig[key] || cognitoConfig[key].includes('XXXXXXXXX'));
  
  if (missing.length > 0) {
    console.warn(`Missing or placeholder values for: ${missing.join(', ')}`);
    return false;
  }
  
  return true;
};

export default cognitoConfig;
