"""
Export API Routes
"""
from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Project, Version
import io

bp = Blueprint('export', __name__)


@bp.route('/export', methods=['POST'])
@jwt_required()
def export_script():
    """Export script to PDF, Word, or text"""
    current_user_id = get_jwt_identity()
    data = request.get_json()

    project_id = data.get('project_id')
    format = data.get('format', 'txt')  # txt, pdf, docx
    version_id = data.get('version_id')

    # Get project
    project = Project.query.filter_by(id=project_id, user_id=current_user_id).first()

    if not project:
        return jsonify({'error': 'Project not found'}), 404

    # Get content
    if version_id:
        version = Version.query.filter_by(id=version_id, project_id=project_id).first()
        content = version.content if version else project.name
    else:
        # Get latest version
        latest_version = Version.query.filter_by(project_id=project_id).order_by(Version.created_at.desc()).first()
        content = latest_version.content if latest_version else f"# 《{project.name}》\n\n剧本内容..."

    # Export based on format
    if format == 'txt':
        return export_as_text(project.name, content)
    elif format == 'pdf':
        return export_as_pdf(project.name, content)
    elif format == 'docx':
        return export_as_docx(project.name, content)
    else:
        return jsonify({'error': 'Unsupported format'}), 400


def export_as_text(project_name, content):
    """Export as plain text"""
    buffer = io.BytesIO()
    buffer.write(content.encode('utf-8'))
    buffer.seek(0)

    return send_file(
        buffer,
        mimetype='text/plain',
        as_attachment=True,
        download_name=f'{project_name}.txt'
    )


def export_as_pdf(project_name, content):
    """Export as PDF"""
    # TODO: Implement PDF export using reportlab or similar
    buffer = io.BytesIO()
    buffer.write(content.encode('utf-8'))
    buffer.seek(0)

    return send_file(
        buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f'{project_name}.pdf'
    )


def export_as_docx(project_name, content):
    """Export as Word document"""
    # TODO: Implement DOCX export using python-docx
    buffer = io.BytesIO()
    buffer.write(content.encode('utf-8'))
    buffer.seek(0)

    return send_file(
        buffer,
        mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        as_attachment=True,
        download_name=f'{project_name}.docx'
    )
