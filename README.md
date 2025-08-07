# Topper AI Mentor

An AI-powered web application designed to assist TopperRank students in their academic journey through personalized learning support, intelligent content recommendations, and real-time query resolution.

## Features

- 🤖 **AI Chatbot** - Academic questions across Data Science, App Development, Cyber Security
- 📚 **Learning Recommendation System** - Personalized topic suggestions based on performance
- ❓ **Doubt Resolver** - Real-time NLP-based Q&A engine
- ⏰ **Deadline Tracker** - Smart reminders for assignments and projects
- 🎤 **Voice-to-Text** - Quick queries and note-taking
- 🔐 **Secure Authentication** - Student login and access control
- 🔗 **LMS Integration** - Seamless access to learning materials

## Tech Stack

### Backend

- **Framework**: Flask/FastAPI
- **AI/ML**: NLP, Machine Learning models
- **Database**: SQLite/PostgreSQL
- **Authentication**: JWT tokens
- **APIs**: Google Drive, TopperRank LMS integration

### Frontend

- **Framework**: React
- **UI Components**: Modern responsive design
- **State Management**: Context API/Redux
- **HTTP Client**: Axios

## Quick Start

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## Development

The application runs on:

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## 🚀 Deployment

### Quick Deploy with Docker

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit .env with your API keys
nano .env

# 3. Deploy with Docker Compose
docker-compose up --build -d
```

### Cloud Deployment Options

#### **Free Hosting (Recommended)**

- **Frontend**: [Vercel](https://vercel.com) (Free)
- **Backend**: [Railway](https://railway.app) (Free tier)

#### **VPS Hosting**

- **DigitalOcean**: $5/month droplet
- **Linode**: $5/month VPS
- **AWS EC2**: Free tier available

#### **One-Click Deployment**

```bash
# Make script executable (Linux/Mac)
chmod +x deploy.sh

# Run deployment helper
./deploy.sh
```

📋 **For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)**

## Project Structure

```
topper-ai-mentor/
├── README.md              # Main documentation
├── DEPLOYMENT.md          # Deployment guide
├── docker-compose.yml     # Docker orchestration
├── Dockerfile.backend     # Backend container
├── Dockerfile.frontend    # Frontend container
├── nginx.conf            # Web server config
├── deploy.sh             # Deployment script
├── .env.example          # Environment template
├── backend/              # Flask API server
│   ├── app.py            # Main application
│   ├── models/           # Database models
│   ├── routes/           # API endpoints
│   ├── services/         # AI services
│   └── algorithms/       # Educational AI/ML demos
└── frontend/             # React application
    ├── src/              # React components
    ├── public/           # Static assets
    └── package.json      # Dependencies
```

## 🌐 Live Demo

- **Frontend**: [Deploy to Vercel](https://vercel.com/new/clone?repository-url=https://github.com/AshutoshMore142k4/topperaimentor-)
- **Backend**: [Deploy to Railway](https://railway.app/new/template)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
