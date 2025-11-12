export interface CalculationNode {
  id: string;
  rootId: string;
  parentId: string | null;
  operation: 'add' | 'subtract' | 'multiply' | 'divide' | null;
  rightOperand: number | null;
  result: number;
  createdAt: string;
  createdBy: {
    id: string;
    username: string;
  } | null;
  children: CalculationNode[];
}

export interface AuthenticatedUser {
  id: string;
  username: string;
  role: string;
}

export interface AuthResponse {
  user: AuthenticatedUser;
  token: string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:4000';

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...rest } = options;
  const headers = new Headers(rest.headers);

  if (!headers.has('Content-Type') && rest.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers
  });

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message: unknown }).message)
        : 'Request failed.';
    throw new Error(message);
  }

  return payload as T;
}

export async function fetchDiscussions(): Promise<CalculationNode[]> {
  const data = await request<{ data: CalculationNode[] }>('/api/discussions');
  return data.data;
}

export async function registerUser(payload: {
  username: string;
  password: string;
}): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function loginUser(payload: {
  username: string;
  password: string;
}): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function createStartingNumber(
  startingNumber: number,
  token: string
): Promise<CalculationNode> {
  const data = await request<{ data: CalculationNode }>('/api/discussions', {
    method: 'POST',
    body: JSON.stringify({ startingNumber }),
    token
  });
  return data.data;
}

export async function appendOperation(
  parentId: string,
  payload: { operation: 'add' | 'subtract' | 'multiply' | 'divide'; rightOperand: number },
  token: string
): Promise<CalculationNode> {
  const data = await request<{ data: CalculationNode }>(
    `/api/discussions/${parentId}/operations`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
      token
    }
  );
  return data.data;
}

