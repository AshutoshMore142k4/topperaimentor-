import google.generativeai as genai
import os
from datetime import datetime, timezone
import json
import re
from typing import List, Dict, Any
from models.database import save_chat_history, get_user_chat_history, save_user_interaction

class AIchatbot:
    """AI Chatbot for academic assistance using Google Gemini"""
    
    def __init__(self):
        # Initialize Google Gemini API
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        if self.gemini_api_key:
            genai.configure(api_key=self.gemini_api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            print("Warning: No Gemini API key found. Using fallback responses.")
            self.model = None
        
        # Domain-specific knowledge bases
        self.domain_contexts = {
            'data_science': {
                'keywords': ['python', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'machine learning', 'deep learning', 'statistics', 'data analysis'],
                'system_prompt': "You are an expert Data Science tutor. Help students with Python programming, data analysis, machine learning concepts, and statistical methods."
            },
            'app_development': {
                'keywords': ['react', 'javascript', 'html', 'css', 'node.js', 'mobile app', 'android', 'ios', 'flutter', 'react native'],
                'system_prompt': "You are an expert App Development tutor. Help students with web and mobile app development, programming languages, and development frameworks."
            },
            'cyber_security': {
                'keywords': ['security', 'encryption', 'vulnerability', 'penetration testing', 'network security', 'malware', 'firewall'],
                'system_prompt': "You are an expert Cybersecurity tutor. Help students with security concepts, ethical hacking, network protection, and security best practices."
            },
            'general': {
                'keywords': [],
                'system_prompt': "You are a helpful academic tutor. Provide clear, educational responses to student questions across various domains."
            }
        }
    
    def detect_domain(self, message: str) -> str:
        """Detect the domain/subject of the user's message"""
        message_lower = message.lower()
        
        for domain, config in self.domain_contexts.items():
            if domain == 'general':
                continue
                
            keyword_matches = sum(1 for keyword in config['keywords'] 
                                if keyword in message_lower)
            
            if keyword_matches >= 1:
                return domain
        
        return 'general'
    
    def get_context_from_history(self, user_id: int, limit: int = 5) -> str:
        """Get relevant context from user's chat history"""
        try:
            history = get_user_chat_history(user_id, limit)
            if not history:
                return ""
            
            context_parts = []
            for chat in history:
                context_parts.append(f"User: {chat['message']}")
                context_parts.append(f"Assistant: {chat['response']}")
            
            return "\n".join(context_parts[-10:])  # Last 5 conversations
        except Exception as e:
            print(f"Error getting context: {e}")
            return ""
    
    def process_message(self, message: str, user_id: int, domain: str = None) -> Dict[str, Any]:
        """Process user message and generate AI response"""
        try:
            # Auto-detect domain if not provided
            if not domain or domain == 'auto':
                domain = self.detect_domain(message)
            
            # Get conversation context
            context = self.get_context_from_history(user_id)
            
            # Generate response
            if self.model:
                response = self._generate_gemini_response(message, domain, context)
            else:
                response = self._generate_fallback_response(message, domain)
            
            # Save to history
            save_chat_history(user_id, message, response['text'], domain, response.get('confidence', 0.8))
            
            # Save interaction for learning
            save_user_interaction(
                user_id, 
                'chat_message', 
                content_type='ai_response',
                duration=response.get('processing_time', 0)
            )
            
            return {
                'text': response['text'],
                'domain': domain,
                'confidence': response.get('confidence', 0.8),
                'suggestions': response.get('suggestions', []),
                'resources': response.get('resources', []),
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            print(f"Error processing message: {e}")
            return {
                'text': "I apologize, but I'm having trouble processing your request right now. Please try again or rephrase your question.",
                'domain': domain or 'general',
                'confidence': 0.0,
                'error': True,
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
    
    def _generate_gemini_response(self, message: str, domain: str, context: str) -> Dict[str, Any]:
        """Generate response using Google Gemini API"""
        try:
            system_prompt = self.domain_contexts.get(domain, self.domain_contexts['general'])['system_prompt']
            
            # Construct the prompt with context
            full_prompt = f"""
{system_prompt}

Previous conversation context:
{context if context else "No previous context"}

Current question: {message}

Please provide a helpful, educational response that:
1. Directly answers the student's question
2. Includes relevant examples or explanations
3. Suggests next steps for learning
4. Is appropriate for academic learning

Response:"""
            
            # Generate response using Gemini
            response = self.model.generate_content(full_prompt)
            ai_response = response.text
            
            # Extract suggestions and resources
            suggestions = self._extract_suggestions(ai_response)
            resources = self._extract_resources(domain)
            
            return {
                'text': ai_response,
                'confidence': 0.9,
                'suggestions': suggestions,
                'resources': resources,
                'processing_time': 1.5
            }
            
        except Exception as e:
            print(f"Gemini API error: {e}")
            return self._generate_fallback_response(message, domain)
    
    def _generate_fallback_response(self, message: str, domain: str) -> Dict[str, Any]:
        """Generate fallback response when OpenAI is not available"""
        
        # Simple rule-based responses for demonstration
        fallback_responses = {
            'data_science': {
                'patterns': {
                    r'python|pandas|numpy': "For Python data science, I recommend starting with pandas for data manipulation and numpy for numerical operations. Would you like specific examples?",
                    r'machine learning|ml': "Machine Learning involves training algorithms on data to make predictions. Popular libraries include scikit-learn for beginners and TensorFlow/PyTorch for deep learning.",
                    r'statistics|stats': "Statistics forms the foundation of data science. Key concepts include descriptive statistics, probability distributions, and hypothesis testing."
                }
            },
            'app_development': {
                'patterns': {
                    r'react|javascript': "React is a popular JavaScript library for building user interfaces. Start with components, props, and state management.",
                    r'mobile|android|ios': "For mobile development, consider React Native for cross-platform apps or native development with Java/Kotlin (Android) or Swift (iOS).",
                    r'html|css': "HTML provides structure and CSS handles styling. Start with semantic HTML and responsive CSS design."
                }
            },
            'cyber_security': {
                'patterns': {
                    r'security|vulnerability': "Cybersecurity involves protecting systems from threats. Key areas include network security, application security, and incident response.",
                    r'encryption|crypto': "Encryption secures data by converting it into an unreadable format. Common algorithms include AES for symmetric encryption and RSA for asymmetric encryption.",
                    r'penetration testing|pentest': "Penetration testing involves simulating attacks to find vulnerabilities. It requires knowledge of tools like Nmap, Metasploit, and Burp Suite."
                }
            }
        }
        
        domain_responses = fallback_responses.get(domain, {})
        
        # Check for pattern matches
        for pattern, response in domain_responses.get('patterns', {}).items():
            if re.search(pattern, message.lower()):
                return {
                    'text': response,
                    'confidence': 0.7,
                    'suggestions': [f"Learn more about {domain}", f"Practice {domain} exercises"],
                    'resources': [f"{domain} documentation", f"{domain} tutorials"],
                    'processing_time': 0.1
                }
        
        # Generic response
        return {
            'text': f"I understand you're asking about {domain}. While I don't have a specific answer right now, I'd recommend checking our learning resources or asking a more specific question.",
            'confidence': 0.5,
            'suggestions': ["Try being more specific", "Check learning materials", "Ask for examples"],
            'resources': [],
            'processing_time': 0.1
        }
    
    def _extract_suggestions(self, response: str) -> List[str]:
        """Extract learning suggestions from AI response"""
        # Simple implementation - could be enhanced with NLP
        suggestions = []
        
        if 'recommend' in response.lower():
            suggestions.append("Explore recommended topics")
        if 'practice' in response.lower():
            suggestions.append("Try practice exercises")
        if 'example' in response.lower():
            suggestions.append("Look at more examples")
            
        return suggestions[:3]  # Limit to 3 suggestions
    
    def _extract_resources(self, domain: str) -> List[str]:
        """Extract relevant learning resources"""
        resource_mapping = {
            'data_science': ["Python Documentation", "Pandas Tutorials", "Scikit-learn Examples"],
            'app_development': ["React Documentation", "MDN Web Docs", "Mobile Development Guides"],
            'cyber_security': ["OWASP Guidelines", "Security Best Practices", "Ethical Hacking Resources"],
            'general': ["Study Materials", "Online Courses", "Practice Problems"]
        }
        
        return resource_mapping.get(domain, resource_mapping['general'])[:2]
    
    def get_chat_statistics(self, user_id: int) -> Dict[str, Any]:
        """Get user's chat statistics"""
        try:
            history = get_user_chat_history(user_id, limit=100)
            
            if not history:
                return {'total_chats': 0, 'domains': {}, 'avg_confidence': 0}
            
            domain_counts = {}
            total_confidence = 0
            
            for chat in history:
                domain = chat.get('domain', 'general')
                domain_counts[domain] = domain_counts.get(domain, 0) + 1
                total_confidence += chat.get('confidence_score', 0.8)
            
            return {
                'total_chats': len(history),
                'domains': domain_counts,
                'avg_confidence': total_confidence / len(history),
                'most_active_domain': max(domain_counts.items(), key=lambda x: x[1])[0] if domain_counts else 'general'
            }
            
        except Exception as e:
            print(f"Error getting chat statistics: {e}")
            return {'total_chats': 0, 'domains': {}, 'avg_confidence': 0}
