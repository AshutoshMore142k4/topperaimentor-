import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Deadlines = () => {
  const { user } = useAuth();
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);

  const [newDeadline, setNewDeadline] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium',
    category: 'assignment',
    estimatedHours: 1
  });

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  const categoryIcons = {
    assignment: '📝',
    project: '🏗️',
    exam: '📚',
    meeting: '👥',
    other: '📋'
  };

  useEffect(() => {
    fetchDeadlines();
  }, []);

  const fetchDeadlines = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/deadlines', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDeadlines(data.deadlines || []);
      }
    } catch (error) {
      console.error('Error fetching deadlines:', error);
      // Mock data for demo
      setDeadlines([
        {
          id: 1,
          title: 'Data Science Assignment',
          description: 'Complete machine learning project using Python',
          deadline: '2025-08-05',
          priority: 'high',
          category: 'assignment',
          is_completed: false,
          created_at: '2025-07-25'
        },
        {
          id: 2,
          title: 'Web Development Project',
          description: 'Build a React application with API integration',
          deadline: '2025-08-10',
          priority: 'medium',
          category: 'project',
          is_completed: false,
          created_at: '2025-07-20'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const addDeadline = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/deadlines', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newDeadline.title,
          description: newDeadline.description,
          due_date: newDeadline.deadline,
          priority: newDeadline.priority,
          category: newDeadline.category
        })
      });

      if (response.ok) {
        fetchDeadlines();
        setShowAddForm(false);
        setNewDeadline({
          title: '',
          description: '',
          deadline: '',
          priority: 'medium',
          category: 'assignment',
          estimatedHours: 1
        });
      }
    } catch (error) {
      console.error('Error adding deadline:', error);
    }
  };

  const toggleComplete = async (deadlineId) => {
    // In a real app, you'd call an API to update the deadline
    setDeadlines(prev => 
      prev.map(d => 
        d.id === deadlineId 
          ? { ...d, is_completed: !d.is_completed }
          : d
      )
    );
  };

  const deleteDeadline = async (deadlineId) => {
    if (window.confirm('Are you sure you want to delete this deadline?')) {
      setDeadlines(prev => prev.filter(d => d.id !== deadlineId));
    }
  };

  const generateAIDeadlineAnalysis = async () => {
    setGeneratingSuggestions(true);
    try {
      const upcomingDeadlines = deadlines.filter(d => !d.is_completed && new Date(d.deadline) > new Date());
      const overdueDleines = deadlines.filter(d => !d.is_completed && new Date(d.deadline) < new Date());

      const prompt = `Analyze the following deadline situation and provide smart suggestions:

Current Deadlines:
${upcomingDeadlines.map(d => 
  `- ${d.title} (${d.category}, ${d.priority} priority) - Due: ${d.deadline}`
).join('\n')}

Overdue Items:
${overdueDleines.map(d => 
  `- ${d.title} (${d.category}, ${d.priority} priority) - Was due: ${d.deadline}`
).join('\n')}

Total upcoming: ${upcomingDeadlines.length}
Total overdue: ${overdueDleines.length}

Please provide:
1. Priority recommendations for tackling these deadlines
2. Time management suggestions
3. Risk assessment for missing deadlines
4. Study/work schedule recommendations
5. Stress management tips if workload is high

Be specific and actionable.`;

      const response = await fetch('http://localhost:5000/api/chatbot/test', {
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
        const suggestions = parseAISuggestions(data.data.text);
        setAiSuggestions(suggestions);
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    } finally {
      setGeneratingSuggestions(false);
    }
  };

  const parseAISuggestions = (aiText) => {
    const lines = aiText.split('\n').filter(line => line.trim());
    const suggestions = [];
    
    let currentSuggestion = { title: '', content: '', type: 'general' };

    lines.forEach(line => {
      const cleanLine = line.trim();
      if (cleanLine.includes('Priority') || cleanLine.includes('priority')) {
        if (currentSuggestion.title) suggestions.push(currentSuggestion);
        currentSuggestion = { title: cleanLine, content: '', type: 'priority' };
      } else if (cleanLine.includes('Time') || cleanLine.includes('Schedule')) {
        if (currentSuggestion.title) suggestions.push(currentSuggestion);
        currentSuggestion = { title: cleanLine, content: '', type: 'time' };
      } else if (cleanLine.includes('Risk') || cleanLine.includes('risk')) {
        if (currentSuggestion.title) suggestions.push(currentSuggestion);
        currentSuggestion = { title: cleanLine, content: '', type: 'risk' };
      } else if (cleanLine.includes('Stress') || cleanLine.includes('stress')) {
        if (currentSuggestion.title) suggestions.push(currentSuggestion);
        currentSuggestion = { title: cleanLine, content: '', type: 'wellness' };
      } else if (cleanLine && currentSuggestion.title) {
        currentSuggestion.content += cleanLine + ' ';
      }
    });

    if (currentSuggestion.title) suggestions.push(currentSuggestion);
    return suggestions.slice(0, 4);
  };

  const getDaysUntil = (deadline) => {
    const today = new Date();
    const dueDate = new Date(deadline);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (deadline) => {
    const days = getDaysUntil(deadline);
    if (days < 0) return 'border-red-500 bg-red-50';
    if (days <= 2) return 'border-orange-500 bg-orange-50';
    if (days <= 7) return 'border-yellow-500 bg-yellow-50';
    return 'border-green-500 bg-green-50';
  };

  const filteredAndSortedDeadlines = deadlines
    .filter(deadline => {
      if (filter === 'all') return true;
      if (filter === 'upcoming') return !deadline.is_completed && getDaysUntil(deadline.deadline) >= 0;
      if (filter === 'overdue') return !deadline.is_completed && getDaysUntil(deadline.deadline) < 0;
      if (filter === 'completed') return deadline.is_completed;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'deadline') {
        return new Date(a.deadline) - new Date(b.deadline);
      } else if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return 0;
    });

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
          <h1 className="text-3xl font-bold text-gray-900">Deadline Tracker</h1>
          <p className="text-gray-600 mt-2">Manage your assignments and project deadlines</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={generateAIDeadlineAnalysis}
            disabled={generatingSuggestions}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center"
          >
            {generatingSuggestions ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Analysis
              </>
            )}
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Deadline
          </button>
        </div>
      </div>

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Deadline Management Suggestions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="p-4 bg-white rounded-lg border border-purple-200">
                <h4 className="font-medium text-gray-900 mb-2">{suggestion.title}</h4>
                <p className="text-sm text-gray-700">{suggestion.content.trim()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600 mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2H9z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900">{deadlines.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600 mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-xl font-bold text-gray-900">
                {deadlines.filter(d => !d.is_completed && getDaysUntil(d.deadline) >= 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg text-red-600 mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-xl font-bold text-gray-900">
                {deadlines.filter(d => !d.is_completed && getDaysUntil(d.deadline) < 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg text-green-600 mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-xl font-bold text-gray-900">
                {deadlines.filter(d => d.is_completed).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">Filter:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="upcoming">Upcoming</option>
                <option value="overdue">Overdue</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="deadline">Deadline</option>
                <option value="priority">Priority</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Deadlines List */}
      <div className="space-y-4">
        {filteredAndSortedDeadlines.length > 0 ? (
          filteredAndSortedDeadlines.map((deadline) => (
            <div
              key={deadline.id}
              className={`p-4 rounded-lg border-l-4 ${getUrgencyColor(deadline.deadline)} shadow-md`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleComplete(deadline.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      deadline.is_completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-500'
                    }`}
                  >
                    {deadline.is_completed && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{categoryIcons[deadline.category]}</span>
                      <h3 className={`font-semibold ${deadline.is_completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {deadline.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[deadline.priority]}`}>
                        {deadline.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{deadline.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Due: {new Date(deadline.deadline).toLocaleDateString()}</span>
                      <span>
                        {getDaysUntil(deadline.deadline) < 0 
                          ? `${Math.abs(getDaysUntil(deadline.deadline))} days overdue`
                          : getDaysUntil(deadline.deadline) === 0
                          ? 'Due today'
                          : `${getDaysUntil(deadline.deadline)} days left`
                        }
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteDeadline(deadline.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2H9z" />
            </svg>
            <p className="text-gray-500 text-lg">No deadlines found</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add your first deadline
            </button>
          </div>
        )}
      </div>

      {/* Add Deadline Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Deadline</h2>
            <form onSubmit={addDeadline} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newDeadline.title}
                  onChange={(e) => setNewDeadline(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newDeadline.description}
                  onChange={(e) => setNewDeadline(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newDeadline.deadline}
                    onChange={(e) => setNewDeadline(prev => ({ ...prev, deadline: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newDeadline.priority}
                    onChange={(e) => setNewDeadline(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newDeadline.category}
                  onChange={(e) => setNewDeadline(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="assignment">Assignment</option>
                  <option value="project">Project</option>
                  <option value="exam">Exam</option>
                  <option value="meeting">Meeting</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Deadline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deadlines;
