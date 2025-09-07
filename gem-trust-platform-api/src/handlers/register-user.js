/**
 * Register User Lambda Function
 * 
 * This function handles user registration by:
 * 1. Creating a new user in AWS Cognito User Pool
 * 2. Storing additional user details in DynamoDB
 * 3. Adding the user to the appropriate Cognito Group (Buyer or Seller)
 * 4. Uploading NIC photo to S3 (if provided)
 */

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Resolve LocalStack endpoint if provided
const awsEndpoint = process.env.AWS_ENDPOINT_URL || (process.env.LOCALSTACK_HOSTNAME ? `http://${process.env.LOCALSTACK_HOSTNAME}:4566` : (process.env.LOCALSTACK_URL || undefined));

// Initialize AWS services (point to LocalStack if endpoint provided)
const cognito = new AWS.CognitoIdentityServiceProvider(awsEndpoint ? { endpoint: awsEndpoint } : {});
const dynamodb = new AWS.DynamoDB.DocumentClient(awsEndpoint ? { endpoint: awsEndpoint } : {});
const s3 = new AWS.S3(awsEndpoint ? { endpoint: awsEndpoint, s3ForcePathStyle: true } : {});

// Environment variables
const USER_POOL_ID = process.env.USER_POOL_ID;
const USERS_TABLE = process.env.USERS_TABLE;
const S3_BUCKET = process.env.S3_BUCKET;
const BUYER_GROUP = process.env.BUYER_GROUP || 'Buyers';
const SELLER_GROUP = process.env.SELLER_GROUP || 'Sellers';

/**
 * Lambda handler for user registration
 * @param {Object} event - API Gateway event
 * @param {Object} context - Lambda context
 * @returns {Object} API Gateway response
 */
exports.handler = async (event, context) => {
    console.log('Register User Event:', JSON.stringify(event, null, 2));
    
    try {
        // Parse request body
        const body = JSON.parse(event.body || '{}');
        const {
            email,
            password,
            fullName,
            mobileNumber,
            nicNumber,
            role,
            nicPhotoBase64,
            nicPhotoContentType
        } = body;

        // Validate required fields
        const validation = validateRegistrationData(body);
        if (!validation.isValid) {
            return createResponse(400, {
                error: 'Validation failed',
                details: validation.errors
            });
        }

        // Generate unique user ID
        const userId = uuidv4();

        // Step 1: Create user in Cognito User Pool
        const cognitoUser = await createCognitoUser({
            email,
            password,
            fullName,
            mobileNumber,
            nicNumber,
            role
        });

        // Step 2: Upload NIC photo to S3 (if provided)
        let nicPhotoUrl = null;
        if (nicPhotoBase64 && nicPhotoContentType) {
            nicPhotoUrl = await uploadNicPhoto(userId, nicPhotoBase64, nicPhotoContentType);
        }

        // Step 3: Store user details in DynamoDB
        await storeUserInDynamoDB({
            userId,
            email,
            fullName,
            mobileNumber,
            nicNumber,
            role,
            nicPhotoUrl,
            cognitoSub: cognitoUser.UserSub,
            createdAt: new Date().toISOString(),
            isActive: true
        });

        // Step 4: Add user to appropriate Cognito Group
        await addUserToGroup(cognitoUser.UserSub, role);

        // Return success response
        return createResponse(201, {
            message: 'User registered successfully',
            userId,
            email,
            role,
            requiresConfirmation: true
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle specific AWS errors
        if (error.code === 'UsernameExistsException') {
            return createResponse(409, {
                error: 'User already exists',
                message: 'An account with this email already exists'
            });
        }
        
        if (error.code === 'InvalidPasswordException') {
            return createResponse(400, {
                error: 'Invalid password',
                message: 'Password does not meet requirements'
            });
        }
        
        if (error.code === 'InvalidParameterException') {
            return createResponse(400, {
                error: 'Invalid parameters',
                message: 'Please check your input data'
            });
        }

        return createResponse(500, {
            error: 'Internal server error',
            message: 'Failed to register user'
        });
    }
};

/**
 * Validate registration data
 * @param {Object} data - Registration data
 * @returns {Object} Validation result
 */
function validateRegistrationData(data) {
    const errors = [];
    const required = ['email', 'password', 'fullName', 'mobileNumber', 'nicNumber', 'role'];
    
    // Check required fields
    required.forEach(field => {
        if (!data[field] || data[field].trim() === '') {
            errors.push(`${field} is required`);
        }
    });

    // Validate email format
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('Invalid email format');
    }

    // Validate password strength
    if (data.password && data.password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    // Validate role
    if (data.role && !['Buyer', 'Seller'].includes(data.role)) {
        errors.push('Role must be either Buyer or Seller');
    }

    // Validate NIC number format (Sri Lankan NIC)
    if (data.nicNumber && !/^[0-9]{9}[vVxX]?$/.test(data.nicNumber)) {
        errors.push('Invalid NIC number format');
    }

    // Validate mobile number
    if (data.mobileNumber && !/^\+?[\d\s\-\(\)]{10,}$/.test(data.mobileNumber)) {
        errors.push('Invalid mobile number format');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Create user in Cognito User Pool
 * @param {Object} userData - User data
 * @returns {Object} Cognito user
 */
async function createCognitoUser(userData) {
    const params = {
        UserPoolId: USER_POOL_ID,
        Username: userData.email,
        UserAttributes: [
            {
                Name: 'email',
                Value: userData.email
            },
            {
                Name: 'name',
                Value: userData.fullName
            },
            {
                Name: 'phone_number',
                Value: userData.mobileNumber
            },
            {
                Name: 'custom:nic_number',
                Value: userData.nicNumber
            },
            {
                Name: 'custom:role',
                Value: userData.role
            },
            {
                Name: 'email_verified',
                Value: 'false'
            }
        ],
        TemporaryPassword: userData.password,
        MessageAction: 'SUPPRESS' // Don't send welcome email
    };

    const result = await cognito.adminCreateUser(params).promise();
    
    // Set permanent password
    await cognito.adminSetUserPassword({
        UserPoolId: USER_POOL_ID,
        Username: userData.email,
        Password: userData.password,
        Permanent: true
    }).promise();

    return result.User;
}

/**
 * Store user data in DynamoDB
 * @param {Object} userData - User data
 */
async function storeUserInDynamoDB(userData) {
    const params = {
        TableName: USERS_TABLE,
        Item: {
            userId: userData.userId,
            email: userData.email,
            fullName: userData.fullName,
            mobileNumber: userData.mobileNumber,
            nicNumber: userData.nicNumber,
            role: userData.role,
            nicPhotoUrl: userData.nicPhotoUrl,
            cognitoSub: userData.cognitoSub,
            createdAt: userData.createdAt,
            updatedAt: userData.createdAt,
            isActive: userData.isActive,
            // GSI attributes
            GSI1PK: `USER#${userData.role}`,
            GSI1SK: userData.createdAt,
            GSI2PK: `EMAIL#${userData.email}`,
            GSI2SK: userData.userId
        }
    };

    await dynamodb.put(params).promise();
}

/**
 * Upload NIC photo to S3
 * @param {string} userId - User ID
 * @param {string} base64Data - Base64 encoded image data
 * @param {string} contentType - Image content type
 * @returns {string} S3 URL
 */
async function uploadNicPhoto(userId, base64Data, contentType) {
    // Remove data URL prefix if present
    const base64String = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64String, 'base64');
    
    const key = `nic-photos/${userId}/${Date.now()}.${getFileExtension(contentType)}`;
    
    const params = {
        Bucket: S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: 'private' // Private by default for security
    };

    await s3.upload(params).promise();
    
    // Prefer HTTP URL in local mode for quick testing
    if (awsEndpoint) {
        const base = awsEndpoint.replace(/\/$/, '');
        return `${base}/${S3_BUCKET}/${key}`;
    }
    return `s3://${S3_BUCKET}/${key}`;
}

/**
 * Add user to Cognito Group
 * @param {string} username - Cognito username
 * @param {string} role - User role
 */
async function addUserToGroup(username, role) {
    const groupName = role === 'Buyer' ? BUYER_GROUP : SELLER_GROUP;
    
    const params = {
        UserPoolId: USER_POOL_ID,
        Username: username,
        GroupName: groupName
    };

    await cognito.adminAddUserToGroup(params).promise();
}

/**
 * Get file extension from content type
 * @param {string} contentType - Content type
 * @returns {string} File extension
 */
function getFileExtension(contentType) {
    const extensions = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp'
    };
    
    return extensions[contentType] || 'jpg';
}

/**
 * Create API Gateway response
 * @param {number} statusCode - HTTP status code
 * @param {Object} body - Response body
 * @returns {Object} API Gateway response
 */
function createResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'POST,OPTIONS'
        },
        body: JSON.stringify(body)
    };
}
