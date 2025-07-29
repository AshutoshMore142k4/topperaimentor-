import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Brain, 
  MessageCircle, 
  BookOpen, 
  Calendar, 
  User, 
  LogOut,
  Home,
  BarChart3
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'AI Chat', href: '/chat', icon: MessageCircle },
    { name: 'Learning', href: '/learning', icon: BookOpen },
    { name: 'Progress', href: '/progress', icon: BarChart3 },
    { name: 'Deadlines', href: '/deadlines', icon: Calendar },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-secondary-50">
      {/* Sidebar */}
      <div className="flex flex-col w-64 bg-white shadow-sm border-r border-secondary-200">
        {/* Logo */}
        <div className="flex items-center px-6 py-4 border-b border-secondary-200">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-secondary-900">
              Topper AI Mentor
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-4 py-4 border-t border-secondary-200">
          <div className="flex items-center space-x-3 px-3 py-2">
            <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-secondary-900 truncate">
                {user?.full_name}
              </p>
              <p className="text-xs text-secondary-500 truncate">
                {user?.course} - Sem {user?.semester}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1 text-secondary-400 hover:text-secondary-600 transition-colors duration-200"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
