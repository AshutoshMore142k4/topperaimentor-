import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import ChatInterface from './components/Chat/ChatInterface';
import Learning from './components/Learning/Learning';
import Progress from './components/Progress/Progress';
import Deadlines from './components/Deadlines/Deadlines';
import Layout from './components/Layout/Layout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-secondary-50">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ChatInterface />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/learning"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Learning />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Progress />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/deadlines"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Deadlines />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default App;
