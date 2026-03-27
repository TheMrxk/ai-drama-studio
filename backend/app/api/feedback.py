"""
Feedback API Routes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Feedback, Project
from app.services import PromptService

bp = Blueprint('feedback', __name__)


@bp.route('/feedback', methods=['POST'])
@jwt_required()
def submit_feedback():
    """提交反馈"""
    current_user_id = get_jwt_identity()
    data = request.get_json()

    project_id = data.get('project_id')
    rating = data.get('rating')
    comment = data.get('comment')
    tags = data.get('tags')
    version_id = data.get('version_id')

    if not project_id or not rating:
        return jsonify({'error': 'project_id 和 rating 是必填项'}), 400

    if rating < 1 or rating > 5:
        return jsonify({'error': 'rating 必须在 1-5 之间'}), 400

    # 验证项目存在
    project = Project.query.filter_by(id=project_id, user_id=current_user_id).first()
    if not project:
        return jsonify({'error': '项目不存在'}), 404

    # 保存反馈
    feedback = Feedback(
        user_id=current_user_id,
        project_id=project_id,
        version_id=version_id,
        rating=rating,
        comment=comment,
        tags=tags
    )

    db.session.add(feedback)

    # 触发学习
    service = PromptService(current_user_id)
    service.learn_from_feedback(project_id, rating, comment, tags)

    db.session.commit()

    return jsonify({
        'message': '反馈已提交',
        'feedback': feedback.to_dict()
    }), 201


@bp.route('/projects/<project_id>/feedback', methods=['GET'])
@jwt_required()
def get_project_feedback(project_id):
    """获取项目的所有反馈"""
    current_user_id = get_jwt_identity()

    feedbacks = Feedback.query.filter_by(
        project_id=project_id,
        user_id=current_user_id
    ).order_by(Feedback.created_at.desc()).all()

    return jsonify([fb.to_dict() for fb in feedbacks]), 200


@bp.route('/feedback/stats', methods=['GET'])
@jwt_required()
def get_feedback_stats():
    """获取反馈统计"""
    current_user_id = get_jwt_identity()

    # 简单统计
    feedbacks = Feedback.query.filter_by(user_id=current_user_id).all()

    total = len(feedbacks)
    avg_rating = sum(fb.rating for fb in feedbacks) / total if total > 0 else 0

    # 按评分分布
    rating_dist = {}
    for i in range(1, 6):
        rating_dist[str(i)] = sum(1 for fb in feedbacks if fb.rating == i)

    return jsonify({
        'total': total,
        'average_rating': round(avg_rating, 2),
        'rating_distribution': rating_dist
    }), 200
