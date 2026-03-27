"""
Database Models for AI Drama Studio
"""
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()


def generate_id():
    """Generate unique ID"""
    return f"{'proj' if hasattr(db.Model, '__tablename__') and db.Model.__tablename__ == 'projects' else 'ver'}_{uuid.uuid4().hex[:12]}"


class User(db.Model):
    """User model"""
    __tablename__ = 'users'

    id = db.Column(db.String(20), primary_key=True, default=lambda: f"user_{uuid.uuid4().hex[:12]}")
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    projects = db.relationship('Project', backref='user', lazy=True)

    def __repr__(self):
        return f'<User {self.username}>'


class Project(db.Model):
    """Project model - stores drama script projects"""
    __tablename__ = 'projects'

    id = db.Column(db.String(20), primary_key=True, default=lambda: f"proj_{uuid.uuid4().hex[:12]}")
    user_id = db.Column(db.String(20), db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    setting = db.Column(db.Text, nullable=False)
    characters = db.Column(db.Text, nullable=False)
    plot = db.Column(db.Text, nullable=False)
    ending = db.Column(db.Text, nullable=False)
    episodes = db.Column(db.Integer, default=5)
    style = db.Column(db.String(50), default='温馨喜剧')
    status = db.Column(db.String(20), default='draft')  # draft, generating, completed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    versions = db.relationship('Version', backref='project', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Project {self.name}>'

    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'setting': self.setting,
            'characters': self.characters,
            'plot': self.plot,
            'ending': self.ending,
            'episodes': self.episodes,
            'style': self.style,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class Version(db.Model):
    """Version model - stores script versions"""
    __tablename__ = 'versions'

    id = db.Column(db.String(20), primary_key=True, default=lambda: f"ver_{uuid.uuid4().hex[:12]}")
    project_id = db.Column(db.String(20), db.ForeignKey('projects.id'), nullable=False)
    version = db.Column(db.String(20), nullable=False)  # v1.0, v1.1, etc.
    content = db.Column(db.Text, nullable=False)
    changes = db.Column(db.Text, default='Initial version')
    content_hash = db.Column(db.String(64))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Version {self.version} of Project {self.project_id}>'

    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'project_id': self.project_id,
            'version': self.version,
            'content': self.content,
            'changes': self.changes,
            'content_hash': self.content_hash,
            'created_at': self.created_at.isoformat()
        }


# =============================================
# 扩展模型 - 用于提示词学习和优化功能
# =============================================

class PromptTemplate(db.Model):
    """Prompt Template - 用户自定义 Prompt 模板"""
    __tablename__ = 'prompt_templates'

    id = db.Column(db.String(20), primary_key=True, default=lambda: f"tmpl_{uuid.uuid4().hex[:12]}")
    user_id = db.Column(db.String(20), db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    template = db.Column(db.Text, nullable=False)  # Jinja2 模板语法
    variables = db.Column(db.Text)  # JSON 格式存储可用变量
    style = db.Column(db.String(50))  # 适用风格
    is_default = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<PromptTemplate {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'template': self.template,
            'variables': self.variables,
            'style': self.style,
            'is_default': self.is_default,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class Feedback(db.Model):
    """Feedback - 生成结果反馈"""
    __tablename__ = 'feedback'

    id = db.Column(db.String(20), primary_key=True, default=lambda: f"fb_{uuid.uuid4().hex[:12]}")
    user_id = db.Column(db.String(20), db.ForeignKey('users.id'), nullable=False)
    project_id = db.Column(db.String(20), db.ForeignKey('projects.id'), nullable=False)
    version_id = db.Column(db.String(20), db.ForeignKey('versions.id'), nullable=True)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 分
    comment = db.Column(db.Text)  # 文字反馈
    tags = db.Column(db.String(200))  # JSON 格式存储标签，如 ["对话生硬", "情节合理"]
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    project = db.relationship('Project', backref='feedback_list')
    version = db.relationship('Version', backref='feedback_list')

    def __repr__(self):
        return f'<Feedback {self.id} for Project {self.project_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'project_id': self.project_id,
            'version_id': self.version_id,
            'rating': self.rating,
            'comment': self.comment,
            'tags': self.tags,
            'created_at': self.created_at.isoformat()
        }


class UserPreference(db.Model):
    """User Preference - 用户偏好设置"""
    __tablename__ = 'user_preferences'

    id = db.Column(db.String(20), primary_key=True, default=lambda: f"pref_{uuid.uuid4().hex[:12]}")
    user_id = db.Column(db.String(20), db.ForeignKey('users.id'), nullable=False)
    preference_key = db.Column(db.String(100), nullable=False)  # 偏好键，如 "preferred_style"
    preference_value = db.Column(db.Text, nullable=False)  # JSON 格式存储值
    category = db.Column(db.String(50))  # 分类：style, format, content 等
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (db.UniqueConstraint('user_id', 'preference_key', name='unique_user_preference'),)

    def __repr__(self):
        return f'<UserPreference {self.preference_key} for User {self.user_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'preference_key': self.preference_key,
            'preference_value': self.preference_value,
            'category': self.category,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class ReferenceScript(db.Model):
    """Reference Script - 用户上传的参考剧本"""
    __tablename__ = 'reference_scripts'

    id = db.Column(db.String(20), primary_key=True, default=lambda: f"ref_{uuid.uuid4().hex[:12]}")
    user_id = db.Column(db.String(20), db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    file_path = db.Column(db.String(500))  # 文件存储路径
    content = db.Column(db.Text, nullable=False)  # 剧本内容
    file_type = db.Column(db.String(20), default='txt')  # txt, pdf, docx
    tags = db.Column(db.String(200))  # JSON 格式存储标签
    extra_data = db.Column(db.Text)  # JSON 格式存储额外元数据（避免使用 metadata 保留字）
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<ReferenceScript {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'file_path': self.file_path,
            'file_type': self.file_type,
            'tags': self.tags,
            'metadata': self.metadata,
            'created_at': self.created_at.isoformat()
        }


def init_db():
    """Initialize database"""
    db.create_all()
