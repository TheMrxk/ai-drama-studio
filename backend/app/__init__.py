"""
AI Drama Studio - Backend Application
"""
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

from app.api import api_bp
from app.models import db, init_db


def create_app():
    """Application factory"""
    app = Flask(__name__)

    # Load environment variables
    load_dotenv()

    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///drama_studio.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600))

    # Initialize extensions
    CORS(app)
    db.init_app(app)
    jwt = JWTManager(app)

    # Create database tables
    with app.app_context():
        init_db()

    # Register blueprints
    app.register_blueprint(api_bp, url_prefix='/api')

    # Health check endpoint
    @app.route('/health')
    def health():
        return jsonify({'status': 'ok', 'message': 'AI Drama Studio API is running'})

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
