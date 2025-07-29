from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime, timezone, timedelta
import re

# Create blueprint
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new student"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'full_name', 'student_id']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('full_name')
        student_id = data.get('student_id')
        course = data.get('course', '')
        semester = data.get('semester', 1)
        
        # Validate email format
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate password strength
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters long'}), 400
        
        # Check if user already exists
        from models.database import get_user_by_email, create_user
        existing_user = get_user_by_email(email)
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 400
        
        # Hash password
        password_hash = generate_password_hash(password)
        
        # Create user
        user_id = create_user(
            email=email,
            password_hash=password_hash,
            full_name=full_name,
            student_id=student_id,
            course=course,
            semester=semester
        )
        
        # Create access token
        access_token = create_access_token(identity=user_id)
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'data': {
                'access_token': access_token,
                'user_id': user_id,
                'email': email,
                'full_name': full_name
            }
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login a student"""
    try:
        data = request.get_json()
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Get user from database
        from models.database import get_user_by_email
        user = get_user_by_email(email)
        
        if not user or not check_password_hash(user['password_hash'], password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Create access token
        access_token = create_access_token(identity=user['id'])
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'data': {
                'access_token': access_token,
                'user_id': user['id'],
                'email': user['email'],
                'full_name': user['full_name'],
                'student_id': user['student_id'],
                'course': user['course'],
                'semester': user['semester']
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get user profile"""
    try:
        user_id = get_jwt_identity()
        
        from models.database import get_user_by_id
        user = get_user_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'success': True,
            'data': {
                'user_id': user['id'],
                'email': user['email'],
                'full_name': user['full_name'],
                'student_id': user['student_id'],
                'course': user['course'],
                'semester': user['semester'],
                'created_at': user['created_at']
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@auth_bp.route('/update-profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Fields that can be updated
        updatable_fields = ['full_name', 'course', 'semester']
        update_data = {}
        
        for field in updatable_fields:
            if field in data:
                update_data[field] = data[field]
        
        if not update_data:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        from models.database import update_user
        success = update_user(user_id, update_data)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Profile updated successfully'
            })
        else:
            return jsonify({'error': 'Failed to update profile'}), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not current_password or not new_password:
            return jsonify({'error': 'Current password and new password are required'}), 400
        
        if len(new_password) < 6:
            return jsonify({'error': 'New password must be at least 6 characters long'}), 400
        
        # Get user and verify current password
        from models.database import get_user_by_id, update_user
        user = get_user_by_id(user_id)
        
        if not user or not check_password_hash(user['password_hash'], current_password):
            return jsonify({'error': 'Current password is incorrect'}), 401
        
        # Update password
        new_password_hash = generate_password_hash(new_password)
        success = update_user(user_id, {'password_hash': new_password_hash})
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Password changed successfully'
            })
        else:
            return jsonify({'error': 'Failed to change password'}), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
