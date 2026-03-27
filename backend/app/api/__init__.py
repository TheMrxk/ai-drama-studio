"""
API Routes Blueprint
"""
from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.api import auth, projects, generate, versions, export, templates, feedback, reference

api_bp = Blueprint('api', __name__)

# Register routes
api_bp.register_blueprint(auth.bp)
api_bp.register_blueprint(projects.bp)
api_bp.register_blueprint(generate.bp)
api_bp.register_blueprint(versions.bp)
api_bp.register_blueprint(export.bp)
api_bp.register_blueprint(templates.bp)
api_bp.register_blueprint(feedback.bp)
api_bp.register_blueprint(reference.bp)
