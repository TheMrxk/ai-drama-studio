"""
Script Generation API Routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Project, Version
from app.services import PromptService
from app.services.ai_api import generate as ai_generate, AIAPIError
import hashlib
import os
import logging

logger = logging.getLogger(__name__)
bp = Blueprint('generate', __name__)


def call_ai_api(prompt, provider='qwen', api_key=None):
    """
    调用 AI API 生成剧本
    支持 Qwen/Claude/Bailian 等大模型
    """
    try:
        # 尝试使用传入的 API Key 或环境变量
        if api_key:
            os.environ[f'{provider.upper()}_API_KEY'] = api_key

        # 调用 AI 服务
        result = ai_generate(prompt=prompt, provider=provider)
        return result

    except AIAPIError as e:
        logger.error(f"AI API 调用失败：{e}")
        return None
    except Exception as e:
        logger.error(f"未知错误：{e}")
        return None


@bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_script():
    """Generate script using AI"""
    current_user_id = get_jwt_identity()
    data = request.get_json()

    project_id = data.get('project_id')
    episode = data.get('episode', 1)
    template_id = data.get('template_id')  # 可选：自定义模板 ID

    if not project_id:
        return jsonify({'error': 'project_id is required'}), 400

    # Get project
    project = Project.query.filter_by(id=project_id, user_id=current_user_id).first()

    if not project:
        return jsonify({'error': 'Project not found'}), 404

    # 使用 Prompt Service 生成提示词
    service = PromptService(current_user_id)

    # 准备模板变量
    variables = {
        'setting': project.setting,
        'characters': project.characters,
        'plot': project.plot,
        'ending': project.ending,
        'episodes': project.episodes,
        'episode': episode,
        'style': project.style
    }

    # 获取并渲染模板
    template = service.get_template(
        style=project.style,
        template_id=template_id
    )
    prompt = service.render_template(template, variables)

    # 获取 API Key 和服务商（从环境变量或用户配置）
    provider = data.get('provider', 'bailian')  # 默认使用阿里云百炼
    model = data.get('model', 'qwen-plus')  # 默认模型
    api_key = os.getenv(f'{provider.upper()}_API_KEY') or data.get('api_key')

    # 调用 AI API
    ai_response = call_ai_api(prompt, provider=provider, api_key=api_key)

    if ai_response and ai_response.get('content'):
        # 使用 AI 返回的内容
        script_content = ai_response.get('content', '')
    else:
        # Mock 响应（用于开发测试）
        script_content = f"""# 《{project.name}》

## 基本信息
- 类型：{project.style}
- 集数：第 {episode} 集 / 共 {project.episodes} 集

---

## 第 {episode} 集

### 第一场
**场景**: 咖啡厅 - 日 - 内
**人物**: {project.characters.split(';')[0] if ';' in project.characters else project.characters}

【动作】场景描述和动作指示

角色 A
（语气）
对话内容...

角色 B
回应内容...

### 第二场
**场景**: 另一个场景
**人物**: 主角

【动作】更多动作描述

角色 A
继续对话...

---

*本集结束*

---
**生成说明**: 当前为开发模式，使用 Mock 数据。配置 API Key 后将调用真实 AI 模型。
**使用模板**: {template_id or project.style or 'default'}
"""

    # 计算内容哈希
    content_hash = hashlib.sha256(script_content.encode('utf-8')).hexdigest()

    # 确定版本号
    last_version = Version.query.filter_by(
        project_id=project_id
    ).order_by(Version.created_at.desc()).first()

    if last_version:
        parts = last_version.version.split('.')
        minor = int(parts[1]) + 1 if len(parts) > 1 else 1
        version_num = f"v1.{minor}"
    else:
        version_num = 'v1.0'

    # Create version record
    version = Version(
        project_id=project_id,
        version=version_num,
        content=script_content,
        changes=f'生成第 {episode} 集剧本',
        content_hash=content_hash
    )

    # Update project status
    project.status = 'completed'

    db.session.add(version)
    db.session.commit()

    # 记录生成历史（用于学习）
    service.record_generation(project_id, template, variables)

    return jsonify({
        'task_id': 'task_mock_123',
        'status': 'completed',
        'script': script_content,
        'version': version.to_dict(),
        'prompt_used': prompt  # 返回使用的 Prompt，方便调试
    }), 200


@bp.route('/generate/regenerate', methods=['POST'])
@jwt_required()
def regenerate_scene():
    """Regenerate a specific scene"""
    data = request.get_json()

    # TODO: Implement scene regeneration
    return jsonify({
        'message': 'Regenerate scene (not implemented)',
        'scene': data.get('scene')
    }), 200
