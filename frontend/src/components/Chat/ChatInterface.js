import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Send, Bot, User, Loader, Brain, Lightbulb, BookOpen } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ChatInterface = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hello ${user?.full_name?.split(' ')[0]}! I'm your AI learning assistant. I can help you with questions about Data Science, App Development, Cybersecurity, and more. What would you like to learn about today?`,
      sender: 'ai',
      timestamp: new Date(),
      domain: 'general'
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('auto');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const domains = [
    { value: 'auto', label: 'Auto-detect', icon: Brain },
    { value: 'data_science', label: 'Data Science', icon: Brain },
    { value: 'app_development', label: 'App Development', icon: Brain },
    { value: 'cyber_security', label: 'Cybersecurity', icon: Brain },
    { value: 'general', label: 'General', icon: Brain }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: currentMessage,
      sender: 'user',
      timestamp: new Date(),
      domain: selectedDomain
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    try {
      const response = await axios.post('/api/chatbot/test', {
        message: currentMessage,
        domain: selectedDomain
      });

      if (response.data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          text: response.data.data.text,
          sender: 'ai',
          timestamp: new Date(),
          domain: response.data.data.domain,
          confidence: response.data.data.confidence,
          suggestions: response.data.data.suggestions,
          resources: response.data.data.resources
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble processing your request right now. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
        domain: 'general',
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to get AI response');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-secondary-900">AI Learning Assistant</h1>
              <p className="text-sm text-secondary-600">Ask me anything about your studies</p>
            </div>
          </div>
          
          {/* Domain Selector */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-secondary-700">Domain:</label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="text-sm border border-secondary-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {domains.map(domain => (
                <option key={domain.value} value={domain.value}>
                  {domain.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex space-x-3 max-w-3xl ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                message.sender === 'user' 
                  ? 'bg-primary-600' 
                  : message.error 
                    ? 'bg-red-100' 
                    : 'bg-secondary-100'
              }`}>
                {message.sender === 'user' ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className={`h-4 w-4 ${message.error ? 'text-red-600' : 'text-secondary-600'}`} />
                )}
              </div>

              {/* Message Content */}
              <div className={`flex flex-col space-y-2 ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-primary-600 text-white rounded-br-md'
                    : message.error
                      ? 'bg-red-50 text-red-800 rounded-bl-md'
                      : 'bg-secondary-100 text-secondary-900 rounded-bl-md'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>

                {/* Message metadata */}
                <div className="flex items-center space-x-2 text-xs text-secondary-500">
                  <span>{formatTime(message.timestamp)}</span>
                  {message.domain && message.domain !== 'general' && (
                    <>
                      <span>•</span>
                      <span className="capitalize">{message.domain.replace('_', ' ')}</span>
                    </>
                  )}
                  {message.confidence && (
                    <>
                      <span>•</span>
                      <span>{Math.round(message.confidence * 100)}% confident</span>
                    </>
                  )}
                </div>

                {/* Suggestions and Resources */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {message.suggestions.map((suggestion, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-50 text-primary-700 border border-primary-200"
                      >
                        <Lightbulb className="h-3 w-3 mr-1" />
                        {suggestion}
                      </span>
                    ))}
                  </div>
                )}

                {message.resources && message.resources.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {message.resources.map((resource, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-50 text-green-700 border border-green-200"
                      >
                        <BookOpen className="h-3 w-3 mr-1" />
                        {resource}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex space-x-3 max-w-3xl">
              <div className="flex-shrink-0 h-8 w-8 bg-secondary-100 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-secondary-600" />
              </div>
              <div className="bg-secondary-100 text-secondary-900 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center space-x-1">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-secondary-200 p-4">
        <div className="flex space-x-4">
          <div className="flex-1">
            <textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your studies..."
              className="w-full px-4 py-3 border border-secondary-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows="2"
              disabled={isTyping}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || isTyping}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
