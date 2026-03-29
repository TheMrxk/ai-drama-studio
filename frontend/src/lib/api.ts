const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

function getAuthHeader(): string | undefined {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      return `Bearer ${token}`
    }
  }
  return undefined
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: '请求失败',
    }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }
  return response.json()
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const authHeader = getAuthHeader()
  if (authHeader) {
    headers['Authorization'] = authHeader
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  return handleResponse<T>(response)
}

export const api = {
  // Auth
  auth: {
    register: (data: {
      username: string
      email: string
      password: string
    }) => request('/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { username: string; password: string }) =>
      request('/login', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Projects
  projects: {
    list: () => request('/projects'),
    get: (id: string) => request(`/projects/${id}`),
    create: (data: unknown) => request('/projects', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: unknown) =>
      request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/projects/${id}`, { method: 'DELETE' }),
  },

  // Generate
  generate: {
    script: (data: { project_id: string; episode?: number; template?: string; provider?: string; api_key?: string }) => {
      console.log('=== 前端发送生成请求 ===')
      console.log('请求数据:', JSON.stringify(data, null, 2))
      console.log('API Key 是否存在:', !!data.api_key)
      console.log('Provider:', data.provider)
      console.log('完整数据对象:', data)
      const body = JSON.stringify(data)
      console.log('请求体字符串:', body)
      return request('/generate', { method: 'POST', body })
    },
  },

  // Export
  export: {
    txt: (projectId: string) => `/export/${projectId}/txt`,
    pdf: (projectId: string) => `/export/${projectId}/pdf`,
    docx: (projectId: string) => `/export/${projectId}/docx`,
  },
}
