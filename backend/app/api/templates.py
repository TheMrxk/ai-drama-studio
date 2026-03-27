"""
Prompt Templates API Routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services import PromptService

bp = Blueprint('templates', __name__)


@bp.route('/templates', methods=['GET'])
@jwt_required()
def list_templates():
    """获取用户模板列表"""
    current_user_id = get_jwt_identity()
    service = PromptService(current_user_id)

    # 获取用户自定义模板
    user_templates = service.list_templates()

    # 返回内置模板列表
    built_in = [
        {'id': 'default', 'name': '默认模板', 'style': 'default', 'is_built_in': True},
        {'id': 'comedy', 'name': '喜剧模板', 'style': 'comedy', 'is_built_in': True},
        {'id': 'romance', 'name': '爱情模板', 'style': 'romance', 'is_built_in': True},
        {'id': 'suspense', 'name': '悬疑模板', 'style': 'suspense', 'is_built_in': True},
    ]

    return jsonify({
        'user_templates': user_templates,
        'built_in_templates': built_in
    }), 200


@bp.route('/templates', methods=['POST'])
@jwt_required()
def create_template():
    """创建自定义模板"""
    current_user_id = get_jwt_identity()
    data = request.get_json()

    if not data.get('name') or not data.get('template'):
        return jsonify({'error': 'name 和 template 是必填项'}), 400

    service = PromptService(current_user_id)

    try:
        template = service.save_template(
            name=data['name'],
            template=data['template'],
            style=data.get('style', 'custom'),
            variables=data.get('variables')
        )
        return jsonify(template.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/templates/<template_id>', methods=['GET'])
@jwt_required()
def get_template(template_id):
    """获取模板详情"""
    current_user_id = get_jwt_identity()
    service = PromptService(current_user_id)

    # 检查是否是内置模板
    if template_id in service.DEFAULT_TEMPLATES:
        return jsonify({
            'id': template_id,
            'name': f'{template_id}模板',
            'template': service.DEFAULT_TEMPLATES[template_id],
            'is_built_in': True
        }), 200

    # 获取用户模板
    template = service.get_template(template_id=template_id)
    if not template:
        return jsonify({'error': '模板不存在'}), 404

    return jsonify({'template': template}), 200


@bp.route('/templates/<template_id>', methods=['PUT'])
@jwt_required()
def update_template(template_id):
    """更新模板"""
    current_user_id = get_jwt_identity()
    data = request.get_json()

    # TODO: 实现模板更新逻辑
    return jsonify({'message': '模板已更新'}), 200


@bp.route('/templates/<template_id>', methods=['DELETE'])
@jwt_required()
def delete_template(template_id):
    """删除模板"""
    current_user_id = get_jwt_identity()
    service = PromptService(current_user_id)

    if service.delete_template(template_id):
        return jsonify({'message': '模板已删除'}), 200
    else:
        return jsonify({'error': '模板不存在或无权删除'}), 404


@bp.route('/templates/preview', methods=['POST'])
@jwt_required()
def preview_template():
    """预览模板渲染效果"""
    current_user_id = get_jwt_identity()
    data = request.get_json()

    template_id = data.get('template_id')
    variables = data.get('variables', {})

    service = PromptService(current_user_id)
    template = service.get_template(template_id=template_id) if template_id else None

    if not template:
        template = service.DEFAULT_TEMPLATES.get('default')

    try:
        rendered = service.render_template(template, variables)
        return jsonify({'rendered': rendered}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
