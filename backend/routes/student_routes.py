from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone

# Create blueprint
student_bp = Blueprint('student', __name__)

@student_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    """Get student dashboard data"""
    try:
        user_id = get_jwt_identity()
        
        # Get user's learning statistics
        from services.ai_chatbot import AIchatbot
        from models.database import get_user_interactions, get_user_deadlines
        
        ai_chatbot = AIchatbot()
        chat_stats = ai_chatbot.get_chat_statistics(user_id)
        
        # Get recent interactions
        interactions = get_user_interactions(user_id, limit=10)
        
        # Get upcoming deadlines
        deadlines = get_user_deadlines(user_id, upcoming_only=True)
        
        return jsonify({
            'success': True,
            'data': {
                'chat_statistics': chat_stats,
                'recent_interactions': interactions,
                'upcoming_deadlines': deadlines,
                'last_updated': datetime.now(timezone.utc).isoformat()
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@student_bp.route('/learning-progress', methods=['GET'])
@jwt_required()
def get_learning_progress():
    """Get student's learning progress"""
    try:
        user_id = get_jwt_identity()
        
        # Get learning progress data
        from models.database import get_user_learning_progress
        progress = get_user_learning_progress(user_id)
        
        return jsonify({
            'success': True,
            'data': progress
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@student_bp.route('/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    """Get personalized learning recommendations"""
    try:
        user_id = get_jwt_identity()
        domain = request.args.get('domain', 'general')
        
        from services.recommendation_engine import RecommendationEngine
        recommendation_engine = RecommendationEngine()
        
        recommendations = recommendation_engine.get_recommendations(user_id, domain)
        
        return jsonify({
            'success': True,
            'data': recommendations
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
