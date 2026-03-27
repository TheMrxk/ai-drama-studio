"""
Prompt Service - Prompt 模板管理和渲染服务
支持用户自定义模板、模板渲染和学习优化
"""
from app.models import db, PromptTemplate, UserPreference, Feedback
import json


class PromptService:
    """Prompt 管理服务"""

    DEFAULT_TEMPLATES = {
        'default': """你是一位专业编剧，请根据以下信息创作剧本：

故事设定：{setting}
主角特征：{characters}
剧情脉络：{plot}
最终结局：{ending}

要求：
1. 标准剧本格式
2. 包含场景描述、对话、动作
3. 共{episodes}集
4. 风格：{style}

请生成第{episode}集剧本。""",

        'comedy': """你是一位喜剧编剧专家，请创作轻松幽默的剧本：

【故事背景】{setting}
【主要角色】{characters}
【情节发展】{plot}
【故事结局】{ending}

创作要求：
- 使用幽默风趣的对话
- 加入适当的笑点和反转
- 标准剧本格式，包含场景、对话、动作指示
- 共{episodes}集，当前生成第{episode}集
- 风格：{style}""",

        'romance': """你是一位爱情剧编剧，请创作温馨感人的爱情剧本：

【时代背景】{setting}
【主角介绍】{characters}
【感情发展】{plot}
【最终归宿】{ending}

创作要求：
- 注重情感细节描写
- 对话要体现人物性格和情感变化
- 标准剧本格式
- 共{episodes}集，当前生成第{episode}集
- 风格：{style}""",

        'suspense': """你是一位悬疑剧编剧，请创作扣人心弦的悬疑剧本：

【故事设定】{setting}
【角色介绍】{characters}
【案情发展】{plot}
【真相揭晓】{ending}

创作要求：
- 设置悬念和伏笔
- 情节紧凑，节奏感强
- 标准剧本格式
- 共{episodes}集，当前生成第{episode}集
- 风格：{style}"""
    }

    def __init__(self, user_id=None):
        self.user_id = user_id

    def get_template(self, style='default', template_id=None):
        """
        获取 Prompt 模板
        优先级：用户自定义模板 > 内置风格模板 > 默认模板
        """
        if template_id:
            # 获取指定模板
            template = PromptTemplate.query.get(template_id)
            if template and (template.user_id == self.user_id or template.is_default):
                return template.template

        # 尝试获取用户自定义的风格模板
        if self.user_id:
            user_template = PromptTemplate.query.filter_by(
                user_id=self.user_id,
                style=style
            ).first()
            if user_template:
                return user_template.template

        # 返回内置模板
        return self.DEFAULT_TEMPLATES.get(style, self.DEFAULT_TEMPLATES['default'])

    def render_template(self, template, variables):
        """
        渲染模板
        :param template: 模板字符串
        :param variables: 变量字典
        :return: 渲染后的字符串
        """
        try:
            return template.format(**variables)
        except KeyError as e:
            # 处理缺失变量
            raise ValueError(f"模板缺少变量：{e}")

    def save_template(self, name, template, style='custom', variables=None):
        """
        保存用户自定义模板
        """
        if not self.user_id:
            raise ValueError("用户未登录")

        tmpl = PromptTemplate(
            user_id=self.user_id,
            name=name,
            template=template,
            style=style,
            variables=json.dumps(variables) if variables else None
        )

        db.session.add(tmpl)
        db.session.commit()
        return tmpl

    def list_templates(self):
        """
        获取用户模板列表
        """
        if not self.user_id:
            return []

        templates = PromptTemplate.query.filter_by(user_id=self.user_id).all()
        return [t.to_dict() for t in templates]

    def delete_template(self, template_id):
        """
        删除模板
        """
        template = PromptTemplate.query.filter_by(
            id=template_id,
            user_id=self.user_id
        ).first()

        if not template:
            return False

        db.session.delete(template)
        db.session.commit()
        return True

    def get_user_variables(self):
        """
        获取用户自定义变量（从参考剧本等提取）
        """
        if not self.user_id:
            return {}

        # 从用户偏好中获取
        prefs = UserPreference.query.filter_by(user_id=self.user_id).all()
        variables = {}
        for pref in prefs:
            try:
                variables[pref.preference_key] = json.loads(pref.preference_value)
            except:
                variables[pref.preference_key] = pref.preference_value

        return variables

    def record_generation(self, project_id, template_used, variables):
        """
        记录生成历史，用于后续学习优化
        """
        # 预留学习接口
        # TODO: 将生成记录存入数据库，用于分析用户偏好
        pass

    def learn_from_feedback(self, project_id, rating, comment=None, tags=None):
        """
        从反馈中学习，优化 Prompt
        :param project_id: 项目 ID
        :param rating: 评分 1-5
        :param comment: 文字反馈
        :param tags: 标签列表
        """
        # 预留学习接口
        # TODO: 根据反馈调整用户偏好
        # TODO: 分析哪些模板元素导致好评/差评

        if self.user_id:
            # 保存反馈记录
            feedback = Feedback(
                user_id=self.user_id,
                project_id=project_id,
                rating=rating,
                comment=comment,
                tags=json.dumps(tags) if tags else None
            )
            db.session.add(feedback)
            db.session.commit()

            # 触发偏好更新
            self._update_preferences_from_feedback(rating, tags)

    def _update_preferences_from_feedback(self, rating, tags):
        """
        根据反馈更新用户偏好
        """
        if not tags:
            return

        # TODO: 实现智能偏好学习算法
        # 例如：用户多次给"对话幽默"好评，则偏好中添加幽默风格
        pass


# 全局服务实例（用于无用户上下文）
default_service = PromptService()


def render_prompt(template_name, variables, style=None, user_id=None):
    """
    便捷函数：渲染 Prompt
    """
    service = PromptService(user_id) if user_id else default_service
    template = service.get_template(style or template_name)
    return service.render_template(template, variables)
