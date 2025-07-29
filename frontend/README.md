# Topper AI Mentor - Frontend

Modern React frontend for the Topper AI Mentor educational platform.

## Features

- 🔐 **Authentication** - Login and registration with JWT tokens
- 💬 **AI Chat Interface** - Real-time chat with Gemini AI
- 📊 **Dashboard** - Overview of learning progress and statistics
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- 📱 **Mobile Friendly** - Responsive design that works on all devices

## Tech Stack

- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Toast notifications

## Quick Start

### Prerequisites

Make sure you have Node.js installed (version 16 or higher).

### Installation

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The application will open at `http://localhost:3000`.

### Backend Connection

The frontend is configured to proxy API requests to the backend server running on `http://localhost:5000`. Make sure your backend server is running before using the frontend.

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Project Structure

```
src/
├── components/
│   ├── Auth/           # Login and registration
│   ├── Chat/           # AI chat interface
│   ├── Dashboard/      # Main dashboard
│   └── Layout/         # Navigation and layout
├── contexts/           # React contexts (Auth)
├── App.js             # Main app component
├── index.js           # App entry point
└── index.css          # Global styles
```

## Key Features

### Authentication

- Secure login and registration
- JWT token-based authentication
- Automatic token refresh
- Protected routes

### AI Chat

- Real-time chat with Gemini AI
- Domain-specific responses
- Confidence scoring
- Learning suggestions and resources
- Message history

### Dashboard

- Learning statistics
- Quick action buttons
- Recent activity
- Upcoming deadlines

## Development

The app uses:

- React functional components with hooks
- Context API for state management
- Tailwind CSS for styling
- Axios for HTTP requests

## Production Build

To build for production:

```bash
npm run build
```

This creates an optimized build in the `build` folder.
