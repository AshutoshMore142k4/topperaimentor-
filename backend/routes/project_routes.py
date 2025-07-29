from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone

# Create blueprint
project_bp = Blueprint('project', __name__)

@project_bp.route('/list', methods=['GET'])
@jwt_required()
def get_projects():
    """Get user's projects"""
    try:
        user_id = get_jwt_identity()
        
        from models.database import get_user_projects
        projects = get_user_projects(user_id)
        
        return jsonify({
            'success': True,
            'data': projects
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@project_bp.route('/create', methods=['POST'])
@jwt_required()
def create_project():
    """Create a new project"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        title = data.get('title')
        description = data.get('description')
        deadline = data.get('deadline')
        project_type = data.get('type', 'assignment')
        
        if not title:
            return jsonify({'error': 'Project title is required'}), 400
        
        from models.database import create_project
        project_id = create_project(
            user_id=user_id,
            title=title,
            description=description,
            deadline=deadline,
            project_type=project_type
        )
        
        return jsonify({
            'success': True,
            'message': 'Project created successfully',
            'data': {'project_id': project_id}
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
