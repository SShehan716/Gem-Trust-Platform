# Gem Trust Platform

This repository contains both the frontend and backend components of the Gem Trust Platform.

## Project Structure

```
gem trans/
├── gem-trust-platform-web/     # Frontend: Next.js application
└── gem-trust-platform-api/     # Backend: AWS SAM serverless application
```

## Frontend: gem-trust-platform-web

A modern Next.js application built with:
- **Next.js 15.5.2** with App Router
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **ESLint** for code quality
- **React 19** with latest features

### Getting Started

```bash
cd gem-trust-platform-web
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Backend: gem-trust-platform-api

A serverless API built with AWS SAM:
- **Node.js 18.x** runtime
- **AWS Lambda** functions
- **API Gateway** for HTTP endpoints
- **SAM CLI** for local development and deployment

### Getting Started

```bash
cd gem-trust-platform-api
sam build
sam local start-api --port 3002
```

The API will be available at `http://localhost:3002`

### Available Endpoints

- `GET /hello` - Hello World endpoint

### Deployment

```bash
sam build
sam deploy --guided
```

## Development

Both projects are configured with:
- Git repositories initialized
- Proper `.gitignore` files
- Modern development tooling
- TypeScript support (frontend)
- Linting and code quality tools

## Prerequisites

- Node.js 18+ 
- Docker Desktop (for containerized development)
- AWS SAM CLI (for backend development)
- AWS CLI (for backend deployment)

## 🐳 Docker Development

The easiest way to run the project is using Docker:

### Quick Start
```bash
# Start development environment (recommended)
./run-docker.sh dev

# Start production environment
./run-docker.sh prod

# Stop all services
./run-docker.sh stop

# Clean everything
./run-docker.sh clean
```

### Manual Docker Commands
```bash
# Development mode with hot reloading
docker-compose -f docker-compose.dev.yml up --build

# Production mode
docker-compose up --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Docker Services
- **Frontend**: http://localhost:3000 (Next.js with hot reloading)
- **Backend**: http://localhost:3001 (AWS SAM API)
