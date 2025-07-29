from typing import Dict, Any
from datetime import datetime, timezone

class DoubtResolver:
    """AI-powered doubt resolution system"""
    
    def __init__(self):
        self.resolution_history = {}
        
    def resolve_doubt(self, doubt: str, context: str = "", user_id: int = None) -> Dict[str, Any]:
        """Resolve student doubts with AI assistance"""
        
        # Basic doubt resolution (to be enhanced with advanced NLP)
        resolution = f"Thank you for your question: '{doubt}'. "
        
        # Simple keyword-based resolution
        doubt_lower = doubt.lower()
        
        if 'error' in doubt_lower or 'bug' in doubt_lower:
            resolution += "For debugging issues, try checking console logs, reviewing your code syntax, and using debugging tools."
        elif 'algorithm' in doubt_lower:
            resolution += "Algorithms are step-by-step procedures for solving problems. Try breaking down the problem into smaller steps."
        elif 'function' in doubt_lower:
            resolution += "Functions are reusable blocks of code. Make sure you understand parameters, return values, and scope."
        elif 'database' in doubt_lower:
            resolution += "Database queries require understanding of relationships between tables. Start with simple SELECT statements."
        else:
            resolution += "I recommend breaking down your question into smaller parts and checking our learning resources for more detailed explanations."
        
        if context:
            resolution += f" Given the context: '{context[:100]}...', you might also want to review related concepts."
        
        return {
            'doubt': doubt,
            'resolution': resolution,
            'context': context,
            'confidence': 0.7,
            'suggested_resources': [
                'Documentation and tutorials',
                'Practice exercises',
                'Community forums'
            ],
            'resolved_at': datetime.now(timezone.utc).isoformat()
        }
