import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const RecommendationSystem = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [userProfile, setUserProfile] = useState({});
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [performanceData, setPerformanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [generatingRecommendations, setGeneratingRecommendations] = useState(false);

  const interests = [
    { id: 'python', label: 'Python Programming', category: 'programming' },
    { id: 'javascript', label: 'JavaScript', category: 'programming' },
    { id: 'react', label: 'React.js', category: 'web_development' },
    { id: 'machine_learning', label: 'Machine Learning', category: 'data_science' },
    { id: 'data_analysis', label: 'Data Analysis', category: 'data_science' },
    { id: 'cybersecurity', label: 'Cybersecurity', category: 'security' },
    { id: 'cloud_computing', label: 'Cloud Computing', category: 'infrastructure' },
    { id: 'mobile_development', label: 'Mobile Development', category: 'mobile' },
    { id: 'database_design', label: 'Database Design', category: 'database' },
    { id: 'api_development', label: 'API Development', category: 'backend' }
  ];

  const skillLevels = [
    { id: 'beginner', label: 'Beginner', description: 'Just starting out' },
    { id: 'intermediate', label: 'Intermediate', description: 'Some experience' },
    { id: 'advanced', label: 'Advanced', description: 'Experienced practitioner' },
    { id: 'expert', label: 'Expert', description: 'Teaching others' }
  ];

  useEffect(() => {
    fetchUserProfile();
    fetchRecommendations();
  }, []);

  const fetchUserProfile = async () => {
    try {
      // In a real app, fetch from API
      setUserProfile({
        learningGoals: ['Improve programming skills', 'Learn data science'],
        preferredLearningStyle: 'hands-on',
        availableHoursPerWeek: 10,
        currentSkillLevel: 'intermediate'
      });
      
      setSelectedInterests(['python', 'machine_learning', 'data_analysis']);
      
      setPerformanceData({
        strongAreas: ['Python basics', 'Data visualization'],
        weakAreas: ['Machine learning algorithms', 'Statistical analysis'],
        recentTopics: ['pandas', 'matplotlib', 'scikit-learn'],
        completionRate: 0.75,
        avgConfidence: 0.68
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://topperaimentor-production.up.railway.app/api/student/recommendations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Set mock recommendations
      setRecommendations([
        {
          id: 1,
          title: 'Advanced Python for Data Science',
          description: 'Build on your Python foundation with data science applications',
          type: 'course',
          difficulty: 'intermediate',
          estimatedTime: '6 weeks',
          topics: ['pandas', 'numpy', 'scikit-learn'],
          reason: 'Based on your interest in data analysis and current Python skills'
        },
        {
          id: 2,
          title: 'Machine Learning Fundamentals',
          description: 'Learn the core concepts and algorithms of machine learning',
          type: 'course',
          difficulty: 'beginner',
          estimatedTime: '8 weeks',
          topics: ['supervised learning', 'unsupervised learning', 'model evaluation'],
          reason: 'Identified as a growth area in your learning profile'
        }
      ]);
    }
  };

  const generatePersonalizedRecommendations = async () => {
    setGeneratingRecommendations(true);
    try {
      const interestLabels = selectedInterests.map(id => 
        interests.find(i => i.id === id)?.label
      ).filter(Boolean);

      const prompt = `Generate personalized learning recommendations for a student with the following profile:

Learning Interests: ${interestLabels.join(', ')}
Current Skill Level: ${userProfile.currentSkillLevel}
Learning Goals: ${userProfile.learningGoals?.join(', ') || 'General skill improvement'}
Available Time: ${userProfile.availableHoursPerWeek} hours per week
Learning Style: ${userProfile.preferredLearningStyle}

Performance Data:
- Strong Areas: ${performanceData.strongAreas?.join(', ') || 'None identified'}
- Areas for Improvement: ${performanceData.weakAreas?.join(', ') || 'None identified'}
- Recent Topics: ${performanceData.recentTopics?.join(', ') || 'None'}
- Completion Rate: ${((performanceData.completionRate || 0) * 100).toFixed(1)}%
- Average Confidence: ${((performanceData.avgConfidence || 0) * 100).toFixed(1)}%

Please provide 5-8 personalized learning recommendations including:
1. Specific courses or topics to study
2. Skills to develop
3. Projects to build
4. Resources to explore
5. Learning path progression

Format each recommendation with:
- Title
- Description (2-3 sentences)
- Estimated time commitment
- Difficulty level
- Why it's recommended for this student

Focus on building upon strengths while addressing improvement areas.`;

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
        const parsedRecommendations = parseAIRecommendations(data.data.text);
        setRecommendations(parsedRecommendations);
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setGeneratingRecommendations(false);
    }
  };

  const parseAIRecommendations = (aiText) => {
    const sections = aiText.split(/\d+\./).filter(section => section.trim());
    const recommendations = [];

    sections.forEach((section, index) => {
      const lines = section.trim().split('\n').filter(line => line.trim());
      if (lines.length > 0) {
        const title = lines[0].replace(/^[\*\-\s]*/, '').trim();
        const description = lines.slice(1).join(' ').trim();
        
        // Extract metadata using simple patterns
        const timeMatch = description.match(/(\d+[-\s]*(?:weeks?|months?|hours?))/i);
        const difficultyMatch = description.match(/(beginner|intermediate|advanced|expert)/i);
        const reasonMatch = description.match(/(?:because|since|due to|recommended for)[\s:]*(.*?)(?:\.|$)/i);

        recommendations.push({
          id: index + 1,
          title: title || `Learning Recommendation ${index + 1}`,
          description: description.slice(0, 200) + (description.length > 200 ? '...' : ''),
          type: 'ai_generated',
          difficulty: difficultyMatch ? difficultyMatch[1].toLowerCase() : 'intermediate',
          estimatedTime: timeMatch ? timeMatch[1] : 'Varies',
          topics: [],
          reason: reasonMatch ? reasonMatch[1].trim() : 'AI-generated recommendation',
          aiGenerated: true
        });
      }
    });

    return recommendations.slice(0, 6);
  };

  const updateInterests = (interestId) => {
    setSelectedInterests(prev => 
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'course':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
          </svg>
        );
      case 'project':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      case 'skill':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
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
          <h1 className="text-3xl font-bold text-gray-900">Learning Recommendations</h1>
          <p className="text-gray-600 mt-2">Personalized suggestions based on your interests and performance</p>
        </div>
        <button
          onClick={generatePersonalizedRecommendations}
          disabled={generatingRecommendations}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center"
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
              Generate AI Recommendations
            </>
          )}
        </button>
      </div>

      {/* Learning Profile */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Learning Profile</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Interests */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Learning Interests</h3>
            <div className="space-y-2">
              {interests.map(interest => (
                <label key={interest.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedInterests.includes(interest.id)}
                    onChange={() => updateInterests(interest.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{interest.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Performance Overview */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Performance Overview</h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">Strong Areas</p>
                <p className="text-sm text-green-700">{performanceData.strongAreas?.join(', ') || 'None identified yet'}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">Growth Areas</p>
                <p className="text-sm text-yellow-700">{performanceData.weakAreas?.join(', ') || 'None identified yet'}</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="text-sm font-medium text-gray-900">
                  {((performanceData.completionRate || 0) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Confidence</span>
                <span className="text-sm font-medium text-gray-900">
                  {((performanceData.avgConfidence || 0) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recommendations.length > 0 ? (
          recommendations.map((rec) => (
            <div key={rec.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    {getTypeIcon(rec.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(rec.difficulty)}`}>
                        {rec.difficulty}
                      </span>
                      <span className="text-xs text-gray-500">{rec.estimatedTime}</span>
                    </div>
                  </div>
                </div>
                {rec.aiGenerated && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                    AI Generated
                  </span>
                )}
              </div>
              
              <p className="text-gray-700 text-sm mb-3">{rec.description}</p>
              
              {rec.topics && rec.topics.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-600 mb-1">Topics covered:</p>
                  <div className="flex flex-wrap gap-1">
                    {rec.topics.map((topic, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="border-t pt-3">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Why recommended:</span> {rec.reason}
                </p>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <button className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">
                  Start Learning
                </button>
                <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                  Save for Later
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-gray-500 text-lg mb-4">No recommendations yet</p>
            <p className="text-gray-400 mb-4">Complete your learning profile and generate AI-powered recommendations</p>
            <button
              onClick={generatePersonalizedRecommendations}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Generate Recommendations
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationSystem;
