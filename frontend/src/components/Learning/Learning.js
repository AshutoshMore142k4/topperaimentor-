import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Learning = () => {
  const { user } = useAuth();
  const [learningData, setLearningData] = useState({
    progress: {},
    recommendations: [],
    strengths: [],
    improvementAreas: []
  });
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [loading, setLoading] = useState(true);
  const [generatingRecommendations, setGeneratingRecommendations] = useState(false);

  const domains = [
    { value: 'all', label: 'All Domains', color: 'gray' },
    { value: 'data_science', label: 'Data Science', color: 'blue' },
    { value: 'app_development', label: 'App Development', color: 'green' },
    { value: 'cyber_security', label: 'Cyber Security', color: 'red' },
    { value: 'general', label: 'General', color: 'purple' }
  ];

  useEffect(() => {
    fetchLearningProgress();
  }, [selectedDomain]);

  const fetchLearningProgress = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/student/learning-progress', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLearningData(data.data);
      }
    } catch (error) {
      console.error('Error fetching learning progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIRecommendations = async () => {
    setGeneratingRecommendations(true);
    try {
      // Get user's learning statistics first
      const token = localStorage.getItem('token');
      const statsResponse = await fetch('http://localhost:5000/api/chatbot/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let userStats = {};
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        userStats = statsData.data;
      }

      // Generate personalized recommendations using Gemini
      const prompt = `Generate personalized learning recommendations for a student with the following profile:
- Total chat sessions: ${userStats.total_chats || 0}
- Average confidence: ${((userStats.avg_confidence || 0) * 100).toFixed(1)}%
- Active domains: ${Object.keys(userStats.domains || {}).join(', ') || 'None yet'}
- Most active domain: ${userStats.most_active_domain || 'None'}
- Selected focus domain: ${selectedDomain === 'all' ? 'All domains' : selectedDomain.replace('_', ' ')}

Please provide:
1. 3-5 specific learning recommendations
2. Skill improvement suggestions
3. Next steps for advancement
4. Resource suggestions

Format as a structured learning plan.`;

      const response = await fetch('http://localhost:5000/api/chatbot/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: prompt,
          domain: selectedDomain
        })
      });

      if (response.ok) {
        const data = await response.json();
        const recommendations = parseAIRecommendations(data.data.text);
        setLearningData(prev => ({
          ...prev,
          recommendations
        }));
      }
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
    } finally {
      setGeneratingRecommendations(false);
    }
  };

  const parseAIRecommendations = (aiText) => {
    // Simple parsing - in a real app, you'd use more sophisticated NLP
    const lines = aiText.split('\n').filter(line => line.trim());
    const recommendations = [];
    
    let currentSection = '';
    let currentRec = { title: '', description: '', type: 'general' };

    lines.forEach(line => {
      if (line.includes('recommendation') || line.includes('Recommendation')) {
        if (currentRec.title) {
          recommendations.push(currentRec);
        }
        currentRec = { 
          title: line.replace(/^\d+\.?\s*/, '').trim(), 
          description: '', 
          type: 'recommendation' 
        };
      } else if (line.includes('skill') || line.includes('Skill')) {
        currentRec.type = 'skill';
      } else if (line.includes('resource') || line.includes('Resource')) {
        currentRec.type = 'resource';
      } else if (line.trim() && currentRec.title) {
        currentRec.description += line.trim() + ' ';
      }
    });

    if (currentRec.title) {
      recommendations.push(currentRec);
    }

    return recommendations.slice(0, 6); // Limit to 6 recommendations
  };

  const getProgressColor = (confidence) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDomainColor = (domain) => {
    const domainConfig = domains.find(d => d.value === domain);
    return domainConfig ? domainConfig.color : 'gray';
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
          <p className="text-gray-600 mt-2">Track your learning journey and get AI-powered recommendations</p>
        </div>
        <button
          onClick={generateAIRecommendations}
          disabled={generatingRecommendations}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center"
        >
          {generatingRecommendations ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Get AI Recommendations
            </>
          )}
        </button>
      </div>

      {/* Domain Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold mb-3">Learning Domain</h3>
        <div className="flex flex-wrap gap-2">
          {domains.map(domain => (
            <button
              key={domain.value}
              onClick={() => setSelectedDomain(domain.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedDomain === domain.value
                  ? `bg-${domain.color}-500 text-white`
                  : `bg-${domain.color}-100 text-${domain.color}-700 hover:bg-${domain.color}-200`
              }`}
            >
              {domain.label}
            </button>
          ))}
        </div>
      </div>

      {/* Learning Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Progress */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Domain Progress
          </h3>
          <div className="space-y-4">
            {learningData.progress?.domain_progress?.length > 0 ? 
              learningData.progress.domain_progress.map((domain, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {domain.domain?.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-500">
                      {domain.count} sessions • {((domain.avg_confidence || 0) * 100).toFixed(1)}% confidence
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(domain.avg_confidence || 0)}`}
                      style={{ width: `${(domain.avg_confidence || 0) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-center py-4">Start learning to see your progress!</p>
              )
            }
          </div>
        </div>

        {/* Overall Statistics */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Learning Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Total Interactions</span>
              <span className="text-xl font-bold text-blue-600">
                {learningData.progress?.overall_stats?.total_interactions || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Positive Feedback</span>
              <span className="text-xl font-bold text-green-600">
                {learningData.progress?.overall_stats?.positive_interactions || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Average Rating</span>
              <span className="text-xl font-bold text-yellow-600">
                {(learningData.progress?.overall_stats?.average_rating || 0).toFixed(1)}/5
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          AI-Powered Learning Recommendations
        </h3>
        {learningData.recommendations?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learningData.recommendations.map((rec, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className={`p-2 rounded-lg mr-3 ${
                    rec.type === 'recommendation' ? 'bg-blue-100 text-blue-600' :
                    rec.type === 'skill' ? 'bg-green-100 text-green-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {rec.type === 'recommendation' ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    ) : rec.type === 'skill' ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">{rec.title}</h4>
                    <p className="text-sm text-gray-600">{rec.description.trim()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-gray-500 mb-4">No recommendations yet</p>
            <button
              onClick={generateAIRecommendations}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Generate AI Recommendations
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Learning;
