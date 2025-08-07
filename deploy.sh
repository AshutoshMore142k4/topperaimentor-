#!/bin/bash

# Topper AI Mentor Deployment Script
# This script helps deploy the application to various platforms

echo "🚀 Topper AI Mentor Deployment Helper"
echo "======================================"

# Check if environment file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your actual API keys before continuing."
    echo "Required variables:"
    echo "  - GEMINI_API_KEY"
    echo "  - JWT_SECRET_KEY"
    read -p "Press Enter when you've updated the .env file..."
fi

echo ""
echo "Choose deployment method:"
echo "1. Docker Compose (Local/VPS)"
echo "2. Manual VPS Setup"
echo "3. Prepare for Cloud Deployment"
echo "4. Development Setup"

read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo "🐳 Starting Docker Compose deployment..."
        
        # Check if Docker is installed
        if ! command -v docker &> /dev/null; then
            echo "❌ Docker not found. Please install Docker first."
            exit 1
        fi
        
        if ! command -v docker-compose &> /dev/null; then
            echo "❌ Docker Compose not found. Please install Docker Compose first."
            exit 1
        fi
        
        # Build and start containers
        echo "Building and starting containers..."
        docker-compose up --build -d
        
        echo "✅ Deployment complete!"
        echo "🌐 Frontend: http://localhost"
        echo "🔗 Backend API: http://localhost:5000"
        echo ""
        echo "To stop: docker-compose down"
        echo "To view logs: docker-compose logs -f"
        ;;
        
    2)
        echo "🖥️  Manual VPS Setup Instructions:"
        echo ""
        echo "1. SSH into your server:"
        echo "   ssh root@your-server-ip"
        echo ""
        echo "2. Update system:"
        echo "   apt update && apt upgrade -y"
        echo ""
        echo "3. Install dependencies:"
        echo "   apt install python3 python3-pip nodejs npm nginx git -y"
        echo ""
        echo "4. Clone repository:"
        echo "   git clone https://github.com/AshutoshMore142k4/topperaimentor-.git"
        echo "   cd topperaimentor-"
        echo ""
        echo "5. Setup backend:"
        echo "   cd backend"
        echo "   pip3 install -r requirements.txt"
        echo "   cp ../.env.example .env"
        echo "   nano .env  # Edit with your API keys"
        echo "   python3 app.py &"
        echo ""
        echo "6. Setup frontend:"
        echo "   cd ../frontend"
        echo "   npm install"
        echo "   npm run build"
        echo "   sudo cp -r build/* /var/www/html/"
        echo ""
        echo "7. Configure nginx (optional):"
        echo "   sudo cp ../nginx.conf /etc/nginx/sites-available/topper-ai"
        echo "   sudo ln -s /etc/nginx/sites-available/topper-ai /etc/nginx/sites-enabled/"
        echo "   sudo systemctl restart nginx"
        ;;
        
    3)
        echo "☁️  Preparing for Cloud Deployment..."
        echo ""
        echo "✅ Files created for cloud deployment:"
        echo "  - Dockerfile.backend"
        echo "  - Dockerfile.frontend" 
        echo "  - docker-compose.yml"
        echo "  - nginx.conf"
        echo "  - .env.example"
        echo ""
        echo "🌐 Recommended Cloud Platforms:"
        echo ""
        echo "Frontend (Vercel):"
        echo "  1. Go to vercel.com"
        echo "  2. Import GitHub repository"
        echo "  3. Set root directory: frontend"
        echo "  4. Build command: npm run build"
        echo "  5. Output directory: build"
        echo ""
        echo "Backend (Railway):"
        echo "  1. Go to railway.app"
        echo "  2. Import GitHub repository" 
        echo "  3. Set root directory: backend"
        echo "  4. Add environment variables from .env"
        echo ""
        echo "Alternative: DigitalOcean App Platform"
        echo "  1. Upload docker-compose.yml"
        echo "  2. Configure environment variables"
        echo "  3. Deploy"
        ;;
        
    4)
        echo "🔧 Setting up development environment..."
        
        # Backend setup
        echo "Setting up backend..."
        cd backend
        
        if [ ! -f .env ]; then
            cp ../.env.example .env
            echo "📝 Please edit backend/.env with your API keys"
        fi
        
        pip3 install -r requirements.txt
        echo "✅ Backend dependencies installed"
        
        # Frontend setup
        echo "Setting up frontend..."
        cd ../frontend
        npm install
        echo "✅ Frontend dependencies installed"
        
        cd ..
        echo ""
        echo "🎉 Development setup complete!"
        echo ""
        echo "To start development servers:"
        echo "Backend:  cd backend && python app.py"
        echo "Frontend: cd frontend && npm start"
        echo ""
        echo "URLs:"
        echo "Frontend: http://localhost:3000"
        echo "Backend:  http://localhost:5000"
        ;;
        
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "📚 For more detailed instructions, see DEPLOYMENT.md"
echo "🎯 Happy deploying! 🚀"
