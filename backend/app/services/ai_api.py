"""
AI API Service - 大模型 API 调用服务
支持 Qwen、Claude 等大模型
"""
import os
import json
import requests
from typing import Optional, Dict, Any


class AIAPIError(Exception):
    """AI API 调用异常"""
    pass


class BaseAIService:
    """AI 服务基类"""

    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        self.api_key = api_key or self._get_default_api_key()
        self.base_url = base_url or self._get_default_base_url()
        self.session = requests.Session()
        self.session.headers.update(self._get_headers())

    def _get_default_api_key(self) -> Optional[str]:
        """从环境变量获取默认 API Key"""
        raise NotImplementedError

    def _get_default_base_url(self) -> str:
        """获取默认 API 地址"""
        raise NotImplementedError

    def _get_headers(self) -> Dict[str, str]:
        """获取请求头"""
        return {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.api_key}',
        }

    def generate(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """
        调用 AI 模型生成内容
        :param prompt: 提示词
        :param kwargs: 其他参数
        :return: 生成结果
        """
        raise NotImplementedError

    def generate_stream(self, prompt: str, callback, **kwargs):
        """
        流式调用 AI 模型
        :param prompt: 提示词
        :param callback: 接收到数据时的回调函数
        :param kwargs: 其他参数
        """
        raise NotImplementedError


class QwenService(BaseAIService):
    """通义千问 AI 服务"""

    def _get_default_api_key(self) -> Optional[str]:
        return os.getenv('QWEN_API_KEY')

    def _get_default_base_url(self) -> str:
        return "https://dashscope.aliyuncs.com/api/v1"

    def generate(self, prompt: str, model: str = "qwen-plus", **kwargs) -> Dict[str, Any]:
        """
        调用通义千问生成内容

        :param prompt: 提示词
        :param model: 模型名称 (qwen-plus, qwen-max, qwen-turbo)
        :param kwargs: 其他参数 (temperature, max_tokens 等)
        :return: 生成结果
        """
        url = f"{self.base_url}/services/aigc/text-generation/generation"

        payload = {
            "model": model,
            "input": {
                "messages": [
                    {"role": "system", "content": "你是一位专业的剧本创作助手。"},
                    {"role": "user", "content": prompt}
                ]
            },
            "parameters": {
                "temperature": kwargs.get('temperature', 0.7),
                "max_tokens": kwargs.get('max_tokens', 4096),
                "top_p": kwargs.get('top_p', 0.8),
            }
        }

        try:
            response = self.session.post(url, json=payload, timeout=60)
            response.raise_for_status()
            result = response.json()

            if result.get('status_code') != 200:
                raise AIAPIError(f"API 调用失败：{result.get('message', '未知错误')}")

            content = result.get('output', {}).get('text', '')
            return {
                'content': content,
                'usage': result.get('usage', {}),
                'model': model,
            }

        except requests.exceptions.RequestException as e:
            raise AIAPIError(f"网络请求失败：{str(e)}")

    def generate_stream(self, prompt: str, callback, model: str = "qwen-plus", **kwargs):
        """流式调用"""
        url = f"{self.base_url}/services/aigc/text-generation/generation"

        payload = {
            "model": model,
            "input": {
                "messages": [
                    {"role": "system", "content": "你是一位专业的剧本创作助手。"},
                    {"role": "user", "content": prompt}
                ]
            },
            "parameters": {
                "incremental_output": True,
                "temperature": kwargs.get('temperature', 0.7),
                "max_tokens": kwargs.get('max_tokens', 4096),
            }
        }

        try:
            response = self.session.post(url, json=payload, stream=True, timeout=120)
            response.raise_for_status()

            for line in response.iter_lines():
                if line:
                    line_str = line.decode('utf-8')
                    if line_str.startswith('data:'):
                        data = json.loads(line_str[5:])
                        content = data.get('output', {}).get('text', '')
                        if content:
                            callback(content)

        except requests.exceptions.RequestException as e:
            raise AIAPIError(f"流式调用失败：{str(e)}")


class ClaudeService(BaseAIService):
    """Claude AI 服务"""

    def _get_default_api_key(self) -> Optional[str]:
        return os.getenv('CLAUDE_API_KEY')

    def _get_default_base_url(self) -> str:
        return "https://api.anthropic.com/v1"

    def generate(self, prompt: str, model: str = "claude-sonnet-4-20250514", **kwargs) -> Dict[str, Any]:
        """
        调用 Claude 生成内容

        :param prompt: 提示词
        :param model: 模型名称 (claude-sonnet-4-20250514, claude-opus-4-20250514)
        :param kwargs: 其他参数
        :return: 生成结果
        """
        url = f"{self.base_url}/messages"

        # 使用 Anthropic SDK 兼容格式
        payload = {
            "model": model,
            "max_tokens": kwargs.get('max_tokens', 4096),
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": kwargs.get('temperature', 0.7),
            "top_p": kwargs.get('top_p', 0.9),
        }

        # Claude API 需要特殊的 api-key 头部
        headers = self._get_headers().copy()
        headers['anthropic-version'] = '2024-01-01'

        try:
            response = self.session.post(url, json=payload, headers=headers, timeout=120)
            response.raise_for_status()
            result = response.json()

            content = result.get('content', [{}])[0].get('text', '')
            return {
                'content': content,
                'usage': result.get('usage', {}),
                'model': model,
                'stop_reason': result.get('stop_reason'),
            }

        except requests.exceptions.RequestException as e:
            raise AIAPIError(f"网络请求失败：{str(e)}")


class AIServiceFactory:
    """AI 服务工厂"""

    _services = {
        'qwen': QwenService,
        'claude': ClaudeService,
    }

    @classmethod
    def create(cls, provider: str = 'qwen', api_key: Optional[str] = None) -> BaseAIService:
        """
        创建 AI 服务实例

        :param provider: 服务提供商 ('qwen' 或 'claude')
        :param api_key: API Key（可选，不提供则使用环境变量）
        :return: AI 服务实例
        """
        service_class = cls._services.get(provider)
        if not service_class:
            raise ValueError(f"不支持的服务提供商：{provider}")

        return service_class(api_key=api_key)

    @classmethod
    def get_available_providers(cls) -> list:
        """获取可用的服务提供商列表"""
        return list(cls._services.keys())


# 便捷函数
def generate_with_qwen(prompt: str, **kwargs) -> Dict[str, Any]:
    """使用 Qwen 生成内容"""
    service = AIServiceFactory.create('qwen')
    return service.generate(prompt, **kwargs)


def generate_with_claude(prompt: str, **kwargs) -> Dict[str, Any]:
    """使用 Claude 生成内容"""
    service = AIServiceFactory.create('claude')
    return service.generate(prompt, **kwargs)


def generate(prompt: str, provider: str = 'qwen', **kwargs) -> Dict[str, Any]:
    """
    通用生成函数
    :param prompt: 提示词
    :param provider: 服务提供商
    :param kwargs: 其他参数
    :return: 生成结果
    """
    service = AIServiceFactory.create(provider)
    return service.generate(prompt, **kwargs)
