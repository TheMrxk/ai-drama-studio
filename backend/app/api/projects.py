"""
Projects API Routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Project

bp = Blueprint('projects', __name__)


@bp.route('/projects', methods=['POST'])
@jwt_required()
def create_project():
    """Create a new project"""
    current_user_id = get_jwt_identity()
    data = request.get_json()

    # Validate required fields
    required_fields = ['name', 'setting', 'characters', 'plot', 'ending']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    # Create project
    project = Project(
        user_id=current_user_id,
        name=data['name'],
        setting=data['setting'],
        characters=data['characters'],
        plot=data['plot'],
        ending=data['ending'],
        episodes=data.get('episodes', 5),
        style=data.get('style', '温馨喜剧')
    )

    db.session.add(project)
    db.session.commit()

    return jsonify(project.to_dict()), 201


@bp.route('/projects', methods=['GET'])
@jwt_required()
def get_projects():
    """Get all projects for current user"""
    current_user_id = get_jwt_identity()

    projects = Project.query.filter_by(user_id=current_user_id).order_by(Project.updated_at.desc()).all()

    return jsonify([project.to_dict() for project in projects]), 200


@bp.route('/projects/<project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    """Get a specific project"""
    current_user_id = get_jwt_identity()

    project = Project.query.filter_by(id=project_id, user_id=current_user_id).first()

    if not project:
        return jsonify({'error': 'Project not found'}), 404

    return jsonify(project.to_dict()), 200


@bp.route('/projects/<project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    """Update a project"""
    current_user_id = get_jwt_identity()

    project = Project.query.filter_by(id=project_id, user_id=current_user_id).first()

    if not project:
        return jsonify({'error': 'Project not found'}), 404

    data = request.get_json()

    # Update fields
    if 'name' in data:
        project.name = data['name']
    if 'setting' in data:
        project.setting = data['setting']
    if 'characters' in data:
        project.characters = data['characters']
    if 'plot' in data:
        project.plot = data['plot']
    if 'ending' in data:
        project.ending = data['ending']
    if 'episodes' in data:
        project.episodes = data['episodes']
    if 'style' in data:
        project.style = data['style']
    if 'status' in data:
        project.status = data['status']

    db.session.commit()

    return jsonify(project.to_dict()), 200


@bp.route('/projects/<project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    """Delete a project"""
    current_user_id = get_jwt_identity()

    project = Project.query.filter_by(id=project_id, user_id=current_user_id).first()

    if not project:
        return jsonify({'error': 'Project not found'}), 404

    db.session.delete(project)
    db.session.commit()

    return jsonify({'message': 'Project deleted successfully'}), 200
