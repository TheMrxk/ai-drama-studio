"""
Version History API Routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Project, Version

bp = Blueprint('versions', __name__)


@bp.route('/projects/<project_id>/versions', methods=['GET'])
@jwt_required()
def get_versions(project_id):
    """Get all versions of a project"""
    current_user_id = get_jwt_identity()

    # Verify project belongs to user
    project = Project.query.filter_by(id=project_id, user_id=current_user_id).first()

    if not project:
        return jsonify({'error': 'Project not found'}), 404

    versions = Version.query.filter_by(project_id=project_id).order_by(Version.created_at.desc()).all()

    return jsonify({
        'project_id': project_id,
        'versions': [v.to_dict() for v in versions]
    }), 200


@bp.route('/projects/<project_id>/versions/<version_id>', methods=['GET'])
@jwt_required()
def get_version(project_id, version_id):
    """Get a specific version"""
    current_user_id = get_jwt_identity()

    version = Version.query.filter_by(id=version_id, project_id=project_id).first()

    if not version:
        return jsonify({'error': 'Version not found'}), 404

    return jsonify(version.to_dict()), 200


@bp.route('/projects/<project_id>/versions', methods=['POST'])
@jwt_required()
def create_version(project_id):
    """Create a new version (save changes)"""
    current_user_id = get_jwt_identity()

    # Verify project belongs to user
    project = Project.query.filter_by(id=project_id, user_id=current_user_id).first()

    if not project:
        return jsonify({'error': 'Project not found'}), 404

    data = request.get_json()

    if not data.get('content'):
        return jsonify({'error': 'content is required'}), 400

    # Calculate next version number
    last_version = Version.query.filter_by(project_id=project_id).order_by(Version.created_at.desc()).first()

    if last_version:
        # Parse version number and increment
        parts = last_version.version.split('.')
        minor = int(parts[1]) + 1 if len(parts) > 1 else 1
        new_version = f"v1.{minor}"
    else:
        new_version = 'v1.0'

    version = Version(
        project_id=project_id,
        version=new_version,
        content=data['content'],
        changes=data.get('changes', 'Manual edit'),
        content_hash=hash(data['content'])
    )

    db.session.add(version)
    db.session.commit()

    return jsonify(version.to_dict()), 201


@bp.route('/projects/<project_id>/versions/<version_id>', methods=['DELETE'])
@jwt_required()
def delete_version(project_id, version_id):
    """Delete a version"""
    current_user_id = get_jwt_identity()

    version = Version.query.filter_by(id=version_id, project_id=project_id).first()

    if not version:
        return jsonify({'error': 'Version not found'}), 404

    db.session.delete(version)
    db.session.commit()

    return jsonify({'message': 'Version deleted successfully'}), 200


@bp.route('/projects/<project_id>/versions/<version_id>/restore', methods=['POST'])
@jwt_required()
def restore_version(project_id, version_id):
    """Restore a version (revert to this version)"""
    current_user_id = get_jwt_identity()

    # Verify project belongs to user
    project = Project.query.filter_by(id=project_id, user_id=current_user_id).first()

    if not project:
        return jsonify({'error': 'Project not found'}), 404

    version = Version.query.filter_by(id=version_id, project_id=project_id).first()

    if not version:
        return jsonify({'error': 'Version not found'}), 404

    # Calculate next version number
    last_version = Version.query.filter_by(project_id=project_id).order_by(Version.created_at.desc()).first()

    if last_version:
        parts = last_version.version.split('.')
        minor = int(parts[1]) + 1 if len(parts) > 1 else 1
        new_version = f"v1.{minor}"
    else:
        new_version = 'v1.0'

    # Create new version with restored content
    new_version_obj = Version(
        project_id=project_id,
        version=new_version,
        content=version.content,
        changes=f'恢复到版本 {version.version}',
        content_hash=version.content_hash
    )

    db.session.add(new_version_obj)
    db.session.commit()

    return jsonify(new_version_obj.to_dict()), 201
