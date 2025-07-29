from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
from services.ai_chatbot import AIchatbot

# Create blueprint
chatbot_bp = Blueprint('chatbot', __name__)

# Initialize chatbot service
ai_chatbot = AIchatbot()

@chatbot_bp.route('/message', methods=['POST'])
@jwt_required()
def send_message():
    """Send a message to the AI chatbot"""
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        message = data.get('message', '')
        domain = data.get('domain', 'auto')
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Process message through AI chatbot
        response = ai_chatbot.process_message(message, user_id, domain)
        
        return jsonify({
            'success': True,
            'data': response
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@chatbot_bp.route('/test', methods=['POST'])
def test_chatbot():
    """Test endpoint for chatbot without authentication (for development)"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        domain = data.get('domain', 'auto')
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Use a test user ID for development
        test_user_id = 1
        
        # Process message through AI chatbot
        response = ai_chatbot.process_message(message, test_user_id, domain)
        
        return jsonify({
            'success': True,
            'data': response,
            'message': 'Chatbot test response',
            'api_status': 'Using Gemini API' if ai_chatbot.model else 'Using fallback responses'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@chatbot_bp.route('/history', methods=['GET'])
@jwt_required()
def get_chat_history():
    """Get user's chat history"""
    try:
        user_id = get_jwt_identity()
        limit = request.args.get('limit', 20, type=int)
        
        # Get chat history from database
        from models.database import get_user_chat_history
        history = get_user_chat_history(user_id, limit)
        
        return jsonify({
            'success': True,
            'data': {
                'history': history,
                'count': len(history)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@chatbot_bp.route('/statistics', methods=['GET'])
@jwt_required()
def get_chat_statistics():
    """Get user's chat statistics"""
    try:
        user_id = get_jwt_identity()
        
        # Get chat statistics
        stats = ai_chatbot.get_chat_statistics(user_id)
        
        return jsonify({
            'success': True,
            'data': stats
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@chatbot_bp.route('/domains', methods=['GET'])
def get_available_domains():
    """Get list of available domains/subjects"""
    try:
        domains = list(ai_chatbot.domain_contexts.keys())
        
        domain_info = {}
        for domain in domains:
            domain_info[domain] = {
                'name': domain.replace('_', ' ').title(),
                'keywords': ai_chatbot.domain_contexts[domain]['keywords'],
                'description': ai_chatbot.domain_contexts[domain]['system_prompt']
            }
        
        return jsonify({
            'success': True,
            'data': {
                'domains': domain_info,
                'default': 'general'
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
