# Gem Trust Platform

A comprehensive gem trading platform with robust authentication and user management system built with modern technologies.

## 🚀 Features

- **Secure Authentication**: AWS Cognito integration with email verification
- **User Management**: Role-based access control (Buyer/Seller)
- **Document Verification**: NIC photo upload and verification
- **Modern UI**: Responsive design with Tailwind CSS
- **Serverless Backend**: AWS Lambda with DynamoDB and S3
- **Type Safety**: Full TypeScript implementation
- **Docker Support**: Containerized development environment

## 📁 Project Structure

```
gem trans/
├── gem-trust-platform-web/     # Frontend: Next.js application
│   ├── src/app/                # App Router pages
│   ├── lib/                    # Configuration and utilities
│   └── components/             # Reusable React components
└── gem-trust-platform-api/     # Backend: AWS SAM serverless application
    ├── src/handlers/           # Lambda function handlers
    ├── template.yaml           # SAM template
    └── hello-world/            # Legacy hello world function
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 15.5.2** with App Router
- **React 19** with latest features
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **AWS Amplify** for Cognito integration
- **ESLint** for code quality

### Backend
- **AWS Lambda** with Node.js 18.x
- **AWS Cognito** for authentication
- **DynamoDB** for user data storage
- **S3** for document storage
- **API Gateway** for HTTP endpoints
- **AWS SAM** for infrastructure as code

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker Desktop
- AWS CLI configured
- AWS SAM CLI

### 1. Clone and Setup
```bash
git clone <repository-url>
cd "gem trans"
```

### 2. Backend Setup
```bash
cd gem-trust-platform-api
sam build
sam deploy --guided
```

### 3. Frontend Configuration
```bash
cd ../gem-trust-platform-web
cp CONFIGURATION.md .env.local
# Edit .env.local with your AWS deployment values
npm install
npm run dev
```

### 4. Docker Development (Recommended)
```bash
# Start development environment
./run-docker.sh dev

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

## 🔐 Authentication System

### Features
- **Email/Password Authentication**: Secure login with AWS Cognito
- **Email Verification**: Required for account activation
- **Role-Based Access**: Buyer and Seller roles
- **Password Reset**: Forgot password functionality
- **User Profile Management**: Update personal information
- **Document Upload**: NIC photo verification

### User Registration Flow
1. User fills registration form with personal details
2. System validates input and creates Cognito user
3. User details stored in DynamoDB
4. User added to appropriate role group
5. NIC photo uploaded to S3
6. Email verification sent to user
7. User confirms email to activate account

### API Endpoints
- `POST /register` - User registration
- `GET /hello` - Health check endpoint

## 🏗️ Architecture

### Frontend Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Pages   │────│  Auth Context    │────│  AWS Amplify    │
│                 │    │                  │    │                 │
│ - /auth         │    │ - User State     │    │ - Cognito       │
│ - /dashboard    │    │ - Auth Methods   │    │ - API Gateway   │
│ - /profile      │    │ - Error Handling │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Backend Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   API Gateway   │────│   Lambda         │────│   AWS Services  │
│                 │    │   Functions      │    │                 │
│ - /register     │    │ - register-user  │    │ - Cognito       │
│ - /hello        │    │ - hello-world    │    │ - DynamoDB      │
│                 │    │                  │    │ - S3            │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📚 Documentation

- [Backend Setup Guide](gem-trust-platform-api/README.md) - Complete AWS setup instructions
- [Frontend Configuration](gem-trust-platform-web/CONFIGURATION.md) - Environment setup guide
- [API Documentation](gem-trust-platform-api/README.md#testing) - Endpoint testing guide

## 🔧 Development

### Available Scripts

#### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

#### Backend
```bash
sam build                    # Build Lambda functions
sam local start-api         # Start local API
sam deploy                  # Deploy to AWS
sam logs -n FunctionName    # View function logs
```

### Docker Commands
```bash
./run-docker.sh dev     # Development environment
./run-docker.sh prod    # Production environment
./run-docker.sh stop    # Stop all services
./run-docker.sh clean   # Clean everything
```

## 🧪 Testing

### Backend Testing
```bash
# Test registration endpoint
curl -X POST https://YOUR_API_URL/register \
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

### Frontend Testing
1. Navigate to `http://localhost:3000`
2. Click "Sign Up" to test registration
3. Fill out the registration form
4. Check email for verification code
5. Complete email verification
6. Test login functionality

## 🚀 Deployment

### Production Deployment

1. **Backend Deployment**
   ```bash
   cd gem-trust-platform-api
   sam build
   sam deploy --config-env production
   ```

2. **Frontend Deployment**
   ```bash
   cd gem-trust-platform-web
   npm run build
   # Deploy to Vercel, Netlify, or your preferred platform
   ```

3. **Environment Configuration**
   - Update production environment variables
   - Configure custom domain
   - Set up SSL certificates
   - Configure CORS settings

## 🔒 Security Features

- **Password Policy**: Strong password requirements
- **Email Verification**: Required for account activation
- **Role-Based Access**: Granular permission system
- **Document Encryption**: Secure file storage in S3
- **CORS Configuration**: Proper cross-origin settings
- **IAM Roles**: Least privilege access principles

## 📊 Monitoring

### CloudWatch Logs
- Lambda function logs
- API Gateway access logs
- Error tracking and debugging

### Metrics
- User registration success rates
- Authentication failure rates
- API response times
- Error rates and patterns

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
1. Check the documentation
2. Review CloudWatch logs
3. Test individual components
4. Create an issue in the repository

## 🔄 Version History

- **v1.0.0** - Initial release with authentication system
- **v0.1.0** - Basic project setup with Docker support
