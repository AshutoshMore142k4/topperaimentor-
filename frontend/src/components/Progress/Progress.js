import React, { useState, useEffect } from 'react';

const Progress = () => {
  const [progressData, setProgressData] = useState({
    overallProgress: {},
    domainProgress: [],
    weeklyActivity: [],
    achievements: [],
    trends: {}
  });
  const [timeframe, setTimeframe] = useState('week');
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }

        // Fetch learning progress data
        const progressResponse = await fetch('https://topperaimentor-production.up.railway.app/api/student/learning-progress', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Fetch statistics data  
        const statsResponse = await fetch('https://topperaimentor-production.up.railway.app/api/chatbot/statistics', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (progressResponse.ok && statsResponse.ok) {
          const progressData = await progressResponse.json();
          const statsData = await statsResponse.json();
          
          // Combine and process the data
          setProgressData({
            overallProgress: progressData.overall || {},
            domainProgress: progressData.domains || [],
            weeklyActivity: statsData.weekly || [],
            achievements: progressData.achievements || [],
            trends: statsData.trends || []
          });
        }
      } catch (error) {
        console.error('Failed to fetch progress data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [timeframe]);

  const generateAchievements = (stats, progress) => {
    const achievements = [];
    
    if (stats.total_chats >= 10) {
      achievements.push({
        title: 'Chatty Learner',
        description: 'Completed 10+ chat sessions',
        icon: '💬',
        earned: true
      });
    }
    
    if (stats.avg_confidence >= 0.8) {
      achievements.push({
        title: 'Confident Learner',
        description: 'Maintained 80%+ average confidence',
        icon: '🎯',
        earned: true
      });
    }
    
    if (Object.keys(stats.domains || {}).length >= 3) {
      achievements.push({
        title: 'Domain Explorer',
        description: 'Active in 3+ learning domains',
        icon: '🌟',
        earned: true
      });
    }
    
    if (progress.overall_stats?.positive_interactions >= 5) {
      achievements.push({
        title: 'Positive Learner',
        description: 'Received 5+ positive interactions',
        icon: '👍',
        earned: true
      });
    }

    // Add potential achievements
    if (stats.total_chats < 50) {
      achievements.push({
        title: 'Power User',
        description: 'Complete 50 chat sessions',
        icon: '⚡',
        earned: false,
        progress: (stats.total_chats / 50) * 100
      });
    }

    return achievements;
  };

  const calculateTrends = (stats, progress) => {
    // Mock trend calculation - in real app, you'd have historical data
    return {
      confidenceTrend: stats.avg_confidence >= 0.7 ? 'up' : stats.avg_confidence >= 0.5 ? 'stable' : 'down',
      activityTrend: stats.total_chats >= 10 ? 'up' : 'stable',
      domainGrowth: Object.keys(stats.domains || {}).length >= 2 ? 'up' : 'stable'
    };
  };

  const generateAIProgressAnalysis = async () => {
    setGeneratingAnalysis(true);
    try {
      const prompt = `Analyze the learning progress for a student with the following data:

Overall Statistics:
- Total chat sessions: ${progressData.chatStats?.total_chats || 0}
- Average confidence: ${((progressData.chatStats?.avg_confidence || 0) * 100).toFixed(1)}%
- Active domains: ${Object.keys(progressData.chatStats?.domains || {}).join(', ') || 'None'}
- Total interactions: ${progressData.overallProgress?.total_interactions || 0}
- Positive interactions: ${progressData.overallProgress?.positive_interactions || 0}
- Average rating: ${(progressData.overallProgress?.average_rating || 0).toFixed(1)}/5

Domain Progress:
${progressData.domainProgress.map(d => 
  `- ${d.domain}: ${d.count} sessions, ${((d.avg_confidence || 0) * 100).toFixed(1)}% confidence`
).join('\n')}

Please provide:
1. Overall learning assessment
2. Strengths and areas for improvement
3. Specific recommendations for next steps
4. Goal suggestions for continued growth

Provide actionable insights and encouragement.`;

      const response = await fetch('https://topperaimentor-production.up.railway.app/api/chatbot/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: prompt,
          domain: 'general'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiAnalysis(data.data.text);
      }
    } catch (error) {
      console.error('Error generating AI analysis:', error);
    } finally {
      setGeneratingAnalysis(false);
    }
  };

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning Progress</h1>
          <p className="text-gray-600 mt-2">Track your growth and celebrate achievements</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
          <button
            onClick={generateAIProgressAnalysis}
            disabled={generatingAnalysis}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center"
          >
            {generatingAnalysis ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Get AI Analysis
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Progress Analysis */}
      {aiAnalysis && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="p-2 bg-purple-500 rounded-lg text-white mr-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Progress Analysis</h3>
              <div className="text-gray-700 whitespace-pre-line">{aiAnalysis}</div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Learning Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{progressData.chatStats?.total_chats || 0}</p>
            </div>
            <div className="text-2xl">{getTrendIcon(progressData.trends?.activityTrend)}</div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${getProgressPercentage(progressData.chatStats?.total_chats || 0, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Goal: 100 sessions</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
              <p className="text-2xl font-bold text-gray-900">
                {((progressData.chatStats?.avg_confidence || 0) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-2xl">{getTrendIcon(progressData.trends?.confidenceTrend)}</div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${(progressData.chatStats?.avg_confidence || 0) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Goal: 90% confidence</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Domains Explored</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.keys(progressData.chatStats?.domains || {}).length}
              </p>
            </div>
            <div className="text-2xl">{getTrendIcon(progressData.trends?.domainGrowth)}</div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${getProgressPercentage(Object.keys(progressData.chatStats?.domains || {}).length, 5) }%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Goal: 5 domains</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Achievements</p>
              <p className="text-2xl font-bold text-gray-900">
                {progressData.achievements.filter(a => a.earned).length}
              </p>
            </div>
            <div className="text-2xl">🏆</div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full"
                style={{ 
                  width: `${(progressData.achievements.filter(a => a.earned).length / progressData.achievements.length) * 100}%` 
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {progressData.achievements.filter(a => !a.earned).length} more to unlock
            </p>
          </div>
        </div>
      </div>

      {/* Domain Progress and Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Progress */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Domain Mastery
          </h3>
          <div className="space-y-4">
            {progressData.domainProgress.length > 0 ? 
              progressData.domainProgress.map((domain, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {domain.domain?.replace('_', ' ')}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{domain.count} sessions</span>
                      <span className="text-sm font-medium text-gray-900">
                        {((domain.avg_confidence || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        domain.avg_confidence >= 0.8 ? 'bg-green-500' :
                        domain.avg_confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(domain.avg_confidence || 0) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Beginner</span>
                    <span>Intermediate</span>
                    <span>Advanced</span>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-center py-4">Start learning to track domain progress!</p>
              )
            }
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Achievements
          </h3>
          <div className="space-y-3">
            {progressData.achievements.map((achievement, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  achievement.earned
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-gray-50 border-gray-200 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{achievement.icon}</span>
                    <div>
                      <h4 className={`font-medium ${
                        achievement.earned ? 'text-gray-900' : 'text-gray-600'
                      }`}>
                        {achievement.title}
                      </h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                  {achievement.earned ? (
                    <span className="text-green-500 font-bold">✓</span>
                  ) : achievement.progress ? (
                    <div className="text-right">
                      <div className="text-xs text-gray-500">{achievement.progress.toFixed(0)}%</div>
                      <div className="w-16 bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-blue-500 h-1 rounded-full"
                          style={{ width: `${achievement.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
