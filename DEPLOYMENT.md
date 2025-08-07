# Deployment Configuration for Topper AI Mentor

## 🚀 Hosting Options

### Option 1: Free Hosting (Recommended for Testing)

#### Frontend Deployment (Vercel)

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Import your repository
4. Select `frontend` folder as root directory
5. Set build command: `npm run build`
6. Set output directory: `build`
7. Deploy!

#### Backend Deployment (Railway)

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Create new project from GitHub repo
4. Select root directory as `backend`
5. Add environment variables:
   - `GEMINI_API_KEY`: Your Gemini API key
   - `JWT_SECRET_KEY`: Random secret key
   - `FLASK_ENV`: production
6. Deploy!

### Option 2: VPS Hosting (DigitalOcean)

#### Server Setup

```bash
# 1. Create Ubuntu droplet
# 2. SSH into server
ssh root@your-server-ip

# 3. Update system
apt update && apt upgrade -y

# 4. Install dependencies
apt install python3 python3-pip nodejs npm nginx -y

# 5. Clone your repository
git clone https://github.com/AshutoshMore142k4/topperaimentor-.git
cd topperaimentor-
```

#### Backend Setup on Server

```bash
cd backend
pip3 install -r requirements.txt

# Create environment file
cat > .env << EOF
GEMINI_API_KEY=your_api_key_here
JWT_SECRET_KEY=your_jwt_secret_here
FLASK_ENV=production
PORT=5000
EOF

# Run backend
python3 app.py
```

#### Frontend Setup on Server

```bash
cd ../frontend
npm install
npm run build

# Copy build files to nginx
cp -r build/* /var/www/html/
```

### Option 3: Docker Deployment

Create these files in your project root:

#### Dockerfile for Backend

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ .
EXPOSE 5000

CMD ["python", "app.py"]
```

#### Dockerfile for Frontend

```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
```

#### docker-compose.yml

```yaml
version: "3.8"
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "5000:5000"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

## 🔧 Environment Variables Needed

### Backend (.env file):

```
GEMINI_API_KEY=AIzaSyCBWa3tUO9ioHROWJtD6vEZCTyXIE0rQOg
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this
FLASK_ENV=production
PORT=5000
```

### Frontend (if needed):

```
REACT_APP_API_URL=https://your-backend-url.com
```

## 📝 Quick Deployment Commands

### For Railway (Backend):

1. Connect GitHub repo
2. Select `backend` folder
3. Add environment variables
4. Deploy automatically

### For Vercel (Frontend):

1. Connect GitHub repo
2. Set root directory: `frontend`
3. Build command: `npm run build`
4. Output directory: `build`
5. Deploy!

### For DigitalOcean Droplet:

```bash
# After SSH into server
git clone https://github.com/AshutoshMore142k4/topperaimentor-.git
cd topperaimentor-

# Setup backend
cd backend
pip3 install -r requirements.txt
# Add .env file with your API keys
python3 app.py &

# Setup frontend
cd ../frontend
npm install
npm run build
sudo cp -r build/* /var/www/html/
```

## 🎯 Recommended Quick Start

**Easiest Method:**

1. **Frontend**: Deploy to Vercel (free, automatic)
2. **Backend**: Deploy to Railway (free tier, 500 hours/month)
3. **Database**: SQLite (included, no separate hosting needed)

This gets you a live application in ~10 minutes!

## 🔒 Security Notes

- Change JWT secret key in production
- Use environment variables for API keys
- Enable HTTPS in production
- Consider rate limiting for APIs

## 💡 Next Steps

1. Choose your hosting method
2. Set up environment variables
3. Deploy backend first
4. Deploy frontend with backend URL
5. Test the complete application
6. Set up custom domain (optional)

Which hosting option would you like to try first?
