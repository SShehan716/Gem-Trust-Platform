#!/bin/bash

echo "🚀 Gem Trust Platform Docker Runner"
echo "=================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Function to show usage
show_usage() {
    echo "Usage: $0 [dev|prod|stop|clean]"
    echo ""
    echo "Commands:"
    echo "  dev     - Start development environment with hot reloading"
    echo "  prod    - Start production environment"
    echo "  stop    - Stop all containers"
    echo "  clean   - Stop and remove all containers, images, and volumes"
    echo ""
    echo "Examples:"
    echo "  $0 dev      # Start development mode"
    echo "  $0 prod     # Start production mode"
    echo "  $0 stop     # Stop all services"
    echo "  $0 clean    # Clean everything"
}

# Function to start development environment
start_dev() {
    echo "🔧 Starting development environment..."
    docker-compose -f docker-compose.dev.yml up --build -d
    echo ""
    echo "✅ Development environment started!"
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔌 Backend:  http://localhost:3001"
    echo ""
    echo "📝 To view logs: docker-compose -f docker-compose.dev.yml logs -f"
    echo "🛑 To stop: $0 stop"
}

# Function to start production environment
start_prod() {
    echo "🚀 Starting production environment..."
    docker-compose up --build -d
    echo ""
    echo "✅ Production environment started!"
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔌 Backend:  http://localhost:3001"
    echo ""
    echo "📝 To view logs: docker-compose logs -f"
    echo "🛑 To stop: $0 stop"
}

# Function to stop all containers
stop_containers() {
    echo "🛑 Stopping all containers..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    echo "✅ All containers stopped!"
}

# Function to clean everything
clean_all() {
    echo "🧹 Cleaning everything..."
    docker-compose down -v --rmi all
    docker-compose -f docker-compose.dev.yml down -v --rmi all
    docker system prune -f
    echo "✅ Everything cleaned!"
}

# Main script logic
case "${1:-dev}" in
    "dev")
        start_dev
        ;;
    "prod")
        start_prod
        ;;
    "stop")
        stop_containers
        ;;
    "clean")
        clean_all
        ;;
    *)
        show_usage
        exit 1
        ;;
esac
