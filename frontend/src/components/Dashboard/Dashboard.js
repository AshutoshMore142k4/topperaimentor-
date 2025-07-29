import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Brain, 
  MessageCircle, 
  BookOpen, 
  Calendar, 
  TrendingUp,
  Clock,
  Award,
  Target
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      try {
        // In a real app, you'd fetch from API
        // const response = await axios.get('/api/student/dashboard');
        
        // Mock data for demo
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats({
          totalChats: 42,
          domainsExplored: 3,
          avgConfidence: 0.85,
          weeklyProgress: 12,
          upcomingDeadlines: 2,
          completedTasks: 8
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const welcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions = [
    {
      name: 'Start AI Chat',
      description: 'Ask questions and get AI-powered answers',
      icon: MessageCircle,
      color: 'bg-blue-500',
      href: '/chat'
    },
    {
      name: 'Browse Learning',
      description: 'Explore courses and materials',
      icon: BookOpen,
      color: 'bg-green-500',
      href: '/learning'
    },
    {
      name: 'Check Deadlines',
      description: 'View upcoming assignments',
      icon: Calendar,
      color: 'bg-orange-500',
      href: '/deadlines'
    },
    {
      name: 'View Progress',
      description: 'Track your learning journey',
      icon: TrendingUp,
      color: 'bg-purple-500',
      href: '/progress'
    }
  ];

  const statCards = [
    {
      name: 'Total AI Chats',
      value: stats?.totalChats || 0,
      icon: MessageCircle,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      name: 'Domains Explored',
      value: stats?.domainsExplored || 0,
      icon: Target,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      name: 'Avg Confidence',
      value: `${Math.round((stats?.avgConfidence || 0) * 100)}%`,
      icon: Award,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      name: 'Weekly Progress',
      value: `${stats?.weeklyProgress || 0}h`,
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {welcomeMessage()}, {user?.full_name?.split(' ')[0]}!
            </h1>
            <p className="text-primary-100 mt-1">
              Ready to continue your learning journey? Let's make today productive!
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`${stat.bg} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">{stat.name}</p>
                <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <div
              key={action.name}
              className="card hover:shadow-md transition-shadow duration-200 cursor-pointer group"
              onClick={() => window.location.href = action.href}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`${action.color} p-3 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-secondary-900">{action.name}</h3>
                  <p className="text-sm text-secondary-600 mt-1">{action.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Chats */}
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Recent AI Chats</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg">
                <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-secondary-900">
                    Data Science Question {i}
                  </p>
                  <p className="text-xs text-secondary-500">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all chats →
          </button>
        </div>

        {/* Upcoming Deadlines */}
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Upcoming Deadlines</h3>
          <div className="space-y-3">
            {[
              { name: 'ML Assignment 3', date: 'Tomorrow', urgent: true },
              { name: 'React Project', date: '3 days', urgent: false },
              { name: 'Data Analysis Report', date: '1 week', urgent: false }
            ].map((deadline, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`h-2 w-2 rounded-full ${deadline.urgent ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  <div>
                    <p className="text-sm font-medium text-secondary-900">{deadline.name}</p>
                    <p className="text-xs text-secondary-500">Due in {deadline.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all deadlines →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
