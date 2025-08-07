import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const DoubtResolver = () => {
  const { user } = useAuth();
  const [doubt, setDoubt] = useState('');
  const [context, setContext] = useState('');
  const [domain, setDomain] = useState('general');
  const [loading, setLoading] = useState(false);
  const [resolution, setResolution] = useState(null);
  const [recentDoubts, setRecentDoubts] = useState([]);

  const domains = [
    { value: 'general', label: 'General', color: 'gray' },
    { value: 'data_science', label: 'Data Science', color: 'blue' },
    { value: 'app_development', label: 'App Development', color: 'green' },
    { value: 'cyber_security', label: 'Cyber Security', color: 'red' },
    { value: 'mathematics', label: 'Mathematics', color: 'purple' },
    { value: 'programming', label: 'Programming', color: 'indigo' }
  ];

  useEffect(() => {
    // Load recent doubts (mock data for demo)
    setRecentDoubts([
      {
        id: 1,
        question: 'How do I implement a binary search algorithm?',
        domain: 'programming',
        resolved: true,
        timestamp: '2025-07-29T10:00:00Z'
      },
      {
        id: 2,
        question: 'What is the difference between supervised and unsupervised learning?',
        domain: 'data_science',
        resolved: true,
        timestamp: '2025-07-28T15:30:00Z'
      }
    ]);
  }, []);

  const resolveDoubt = async (e) => {
    e.preventDefault();
    if (!doubt.trim()) return;

    setLoading(true);
    try {
      const enhancedPrompt = `
You are an expert academic tutor. A student has the following doubt:

Question: ${doubt}
${context ? `Additional Context: ${context}` : ''}
Domain: ${domain.replace('_', ' ')}

Please provide:
1. A clear, step-by-step explanation
2. Relevant examples or analogies
3. Common misconceptions to avoid
4. Additional resources for deeper understanding
5. Practice suggestions

Make your response educational, encouraging, and easy to understand.
      `;

      const response = await fetch('https://topperaimentor-production.up.railway.app/api/chatbot/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: enhancedPrompt,
          domain: domain
        })
      });

      if (response.ok) {
        const data = await response.json();
        const newResolution = {
          question: doubt,
          answer: data.data.text,
          domain: domain,
          context: context,
          timestamp: new Date().toISOString(),
          confidence: data.data.confidence || 0.9,
          suggestions: data.data.suggestions || [],
          resources: data.data.resources || []
        };

        setResolution(newResolution);
        
        // Add to recent doubts
        setRecentDoubts(prev => [
          { 
            id: Date.now(), 
            question: doubt, 
            domain: domain, 
            resolved: true, 
            timestamp: new Date().toISOString() 
          },
          ...prev.slice(0, 4)
        ]);

        // Clear form
        setDoubt('');
        setContext('');
      }
    } catch (error) {
      console.error('Error resolving doubt:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDomainColor = (domainValue) => {
    const domainConfig = domains.find(d => d.value === domainValue);
    return domainConfig ? domainConfig.color : 'gray';
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Doubt Resolver</h1>
        <p className="text-gray-600 mt-2">Get instant AI-powered solutions to your academic questions</p>
      </div>

      {/* Main Doubt Resolution Form */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Ask Your Question
        </h2>

        <form onSubmit={resolveDoubt} className="space-y-4">
          {/* Domain Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject Domain</label>
            <div className="flex flex-wrap gap-2">
              {domains.map(domainOption => (
                <button
                  key={domainOption.value}
                  type="button"
                  onClick={() => setDomain(domainOption.value)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                    domain === domainOption.value
                      ? `bg-${domainOption.color}-500 text-white`
                      : `bg-${domainOption.color}-100 text-${domainOption.color}-700 hover:bg-${domainOption.color}-200`
                  }`}
                >
                  {domainOption.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Question</label>
            <textarea
              value={doubt}
              onChange={(e) => setDoubt(e.target.value)}
              placeholder="Describe your doubt or question in detail..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="4"
              required
            />
          </div>

          {/* Additional Context */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Context (Optional)</label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Provide any additional context, what you've tried, or specific areas you're struggling with..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="2"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !doubt.trim()}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Resolving your doubt...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Get AI Solution
              </>
            )}
          </button>
        </form>
      </div>

      {/* Resolution Display */}
      {resolution && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="p-2 bg-green-500 rounded-lg text-white mr-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Solution</h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getDomainColor(resolution.domain)}-100 text-${getDomainColor(resolution.domain)}-800`}>
                    {resolution.domain.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-gray-500">
                    Confidence: {(resolution.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              
              <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Question:</p>
                <p className="text-gray-900">{resolution.question}</p>
              </div>

              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-line text-gray-700">{resolution.answer}</div>
              </div>

              {resolution.suggestions && resolution.suggestions.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Next Steps:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {resolution.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-gray-600">{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              {resolution.resources && resolution.resources.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Recommended Resources:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {resolution.resources.map((resource, index) => (
                      <li key={index} className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">{resource}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Doubts */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recent Questions
        </h3>

        {recentDoubts.length > 0 ? (
          <div className="space-y-3">
            {recentDoubts.map((recentDoubt) => (
              <div key={recentDoubt.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{recentDoubt.question}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getDomainColor(recentDoubt.domain)}-100 text-${getDomainColor(recentDoubt.domain)}-800`}>
                        {recentDoubt.domain.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(recentDoubt.timestamp)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {recentDoubt.resolved ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Resolved
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500">No recent questions</p>
            <p className="text-gray-400 text-sm mt-1">Ask your first question to get started!</p>
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Tips for Better Answers
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Be specific about what you're struggling with</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Include any code, formulas, or examples you've tried</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Mention your current understanding level</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Select the appropriate subject domain for better context</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DoubtResolver;
