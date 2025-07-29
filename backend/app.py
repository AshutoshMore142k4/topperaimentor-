from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Import custom modules
from models.database import init_db, get_db_connection
from services.ai_chatbot import AIchatbot
from services.recommendation_engine import RecommendationEngine
from services.doubt_resolver import DoubtResolver
from services.deadline_tracker import DeadlineTracker
from services.voice_service import VoiceService
from routes.auth_routes import auth_bp
from routes.chatbot_routes import chatbot_bp
from routes.student_routes import student_bp
from routes.project_routes import project_bp

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Initialize extensions
CORS(app)
jwt = JWTManager(app)

# Initialize database
init_db()

# Initialize AI services
ai_chatbot = AIchatbot()
recommendation_engine = RecommendationEngine()
doubt_resolver = DoubtResolver()
deadline_tracker = DeadlineTracker()
voice_service = VoiceService()

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(chatbot_bp, url_prefix='/api/chatbot')
app.register_blueprint(student_bp, url_prefix='/api/student')
app.register_blueprint(project_bp, url_prefix='/api/projects')

@app.route('/')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Topper AI Mentor API is running',
        'version': '1.0.0',
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/chat', methods=['POST'])
@jwt_required()
def chat_endpoint():
    """Main chat endpoint for AI interactions"""
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        message = data.get('message', '')
        domain = data.get('domain', 'general')
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Process message through AI chatbot
        response = ai_chatbot.process_message(message, user_id, domain)
        
        # Get learning recommendations if applicable
        recommendations = recommendation_engine.get_recommendations(user_id, domain)
        
        return jsonify({
            'response': response,
            'recommendations': recommendations,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/doubt-resolver', methods=['POST'])
@jwt_required()
def resolve_doubt():
    """Doubt resolution endpoint"""
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        doubt = data.get('doubt', '')
        context = data.get('context', '')
        
        if not doubt:
            return jsonify({'error': 'Doubt is required'}), 400
        
        resolution = doubt_resolver.resolve_doubt(doubt, context, user_id)
        
        return jsonify({
            'resolution': resolution,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/deadlines', methods=['GET', 'POST'])
@jwt_required()
def handle_deadlines():
    """Handle deadline tracking"""
    try:
        user_id = get_jwt_identity()
        
        if request.method == 'GET':
            deadlines = deadline_tracker.get_user_deadlines(user_id)
            return jsonify({'deadlines': deadlines})
        
        elif request.method == 'POST':
            data = request.get_json()
            deadline_data = {
                'title': data.get('title'),
                'description': data.get('description'),
                'due_date': data.get('due_date'),
                'priority': data.get('priority', 'medium'),
                'category': data.get('category', 'assignment')
            }
            
            deadline = deadline_tracker.add_deadline(user_id, deadline_data)
            return jsonify({'deadline': deadline}), 201
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/voice-to-text', methods=['POST'])
@jwt_required()
def voice_to_text():
    """Convert voice to text"""
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'Audio file is required'}), 400
        
        audio_file = request.files['audio']
        user_id = get_jwt_identity()
        
        text = voice_service.convert_speech_to_text(audio_file, user_id)
        
        return jsonify({
            'text': text,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    """Get personalized learning recommendations"""
    try:
        user_id = get_jwt_identity()
        domain = request.args.get('domain', 'all')
        limit = int(request.args.get('limit', 10))
        
        recommendations = recommendation_engine.get_personalized_recommendations(
            user_id, domain, limit
        )
        
        return jsonify({
            'recommendations': recommendations,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    print(f"🚀 Starting Topper AI Mentor API on port {port}")
    print(f"🔧 Debug mode: {debug}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
