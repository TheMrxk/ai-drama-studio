"""
Reference Scripts API Routes
"""
import os
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app.models import db, ReferenceScript

bp = Blueprint('reference', __name__)

ALLOWED_EXTENSIONS = {'txt', 'pdf', 'docx'}
UPLOAD_FOLDER = 'uploads/reference_scripts'


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@bp.route('/reference', methods=['POST'])
@jwt_required()
def upload_reference():
    """上传参考剧本"""
    current_user_id = get_jwt_identity()

    if 'file' not in request.files:
        return jsonify({'error': '未找到上传文件'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': '未选择文件'}), 400

    if file and allowed_file(file.filename):
        # 安全处理文件名
        filename = secure_filename(file.filename)

        # 创建上传目录
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)

        # 保存文件
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        # 读取内容（简单处理，实际应该根据文件类型解析）
        content = ""
        if filename.endswith('.txt'):
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

        # 创建记录
        ref_script = ReferenceScript(
            user_id=current_user_id,
            name=request.form.get('name', filename),
            file_path=filepath,
            content=content,
            file_type=filename.rsplit('.', 1)[1].lower() if '.' in filename else 'txt',
            tags=request.form.get('tags', '[]')
        )

        db.session.add(ref_script)
        db.session.commit()

        return jsonify(ref_script.to_dict()), 201
    else:
        return jsonify({'error': '不支持的文件格式，仅支持 txt, pdf, docx'}), 400


@bp.route('/reference', methods=['GET'])
@jwt_required()
def list_reference():
    """获取参考剧本列表"""
    current_user_id = get_jwt_identity()

    scripts = ReferenceScript.query.filter_by(
        user_id=current_user_id
    ).order_by(ReferenceScript.created_at.desc()).all()

    return jsonify([s.to_dict() for s in scripts]), 200


@bp.route('/reference/<ref_id>', methods=['GET'])
@jwt_required()
def get_reference(ref_id):
    """获取参考剧本详情"""
    current_user_id = get_jwt_identity()

    script = ReferenceScript.query.filter_by(
        id=ref_id,
        user_id=current_user_id
    ).first()

    if not script:
        return jsonify({'error': '参考剧本不存在'}), 404

    return jsonify(script.to_dict()), 200


@bp.route('/reference/<ref_id>', methods=['DELETE'])
@jwt_required()
def delete_reference(ref_id):
    """删除参考剧本"""
    current_user_id = get_jwt_identity()

    script = ReferenceScript.query.filter_by(
        id=ref_id,
        user_id=current_user_id
    ).first()

    if not script:
        return jsonify({'error': '参考剧本不存在'}), 404

    # 删除文件
    if script.file_path and os.path.exists(script.file_path):
        os.remove(script.file_path)

    db.session.delete(script)
    db.session.commit()

    return jsonify({'message': '已删除'}), 200
