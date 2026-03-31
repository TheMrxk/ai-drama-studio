"""
Authentication API Routes
"""
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import db, User

bp = Blueprint('auth', __name__)


@bp.route('/register', methods=['POST'])
def register():
    """User registration"""
    data = request.get_json()

    # Validate input
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Username, email, and password are required'}), 400

    # Check if user exists
    existing_user = User.query.filter(
        (User.username == data['username']) | (User.email == data['email'])
    ).first()

    if existing_user:
        return jsonify({'error': 'Username or email already exists'}), 409

    # Create new user
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password'])
    )

    db.session.add(user)
    db.session.commit()

    # Generate access token
    access_token = create_access_token(identity=user.id)

    return jsonify({
        'message': 'User registered successfully',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email
        },
        'access_token': access_token
    }), 201


@bp.route('/login', methods=['POST'])
def login():
    """User login"""
    data = request.get_json()

    # Validate input
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400

    # Find user
    user = User.query.filter_by(username=data['username']).first()

    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Invalid username or password'}), 401

    # Generate access token
    access_token = create_access_token(identity=user.id)

    return jsonify({
        'message': 'Login successful',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email
        },
        'access_token': access_token
    }), 200


@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user info"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'created_at': user.created_at.isoformat()
    }), 200


@bp.route('/me', methods=['PUT'])
@jwt_required()
def update_current_user():
    """Update current user info"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()

    # Update username
    if 'username' in data:
        if not data['username']:
            return jsonify({'error': 'Username cannot be empty'}), 400
        # Check if username is already taken
        existing = User.query.filter_by(username=data['username']).first()
        if existing and existing.id != user.id:
            return jsonify({'error': 'Username already exists'}), 409
        user.username = data['username']

    # Update email
    if 'email' in data:
        if not data['email']:
            return jsonify({'error': 'Email cannot be empty'}), 400
        # Check if email is already taken
        existing = User.query.filter_by(email=data['email']).first()
        if existing and existing.id != user.id:
            return jsonify({'error': 'Email already exists'}), 409
        user.email = data['email']

    # Update password
    if 'password' in data:
        if not data['password'] or len(data['password']) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        user.password_hash = generate_password_hash(data['password'])

    db.session.commit()

    return jsonify({
        'message': 'User updated successfully',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }
    }), 200
