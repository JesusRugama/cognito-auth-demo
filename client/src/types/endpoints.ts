export interface Endpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  requiredGroup: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export const API_ENDPOINTS: Endpoint[] = [
  {
    id: 'endpoint1',
    method: 'GET',
    path: `${API_BASE_URL}/endpoint1`,
    description: "Read User's addresses list",
    requiredGroup: 'customer | admin',
  },
  {
    id: 'endpoint2',
    method: 'POST',
    path: `${API_BASE_URL}/endpoint2`,
    description: 'Create New Address',
    requiredGroup: 'customer | admin',
  },
  {
    id: 'endpoint3',
    method: 'PUT',
    path: `${API_BASE_URL}/endpoint3`,
    description: 'Update Address',
    requiredGroup: 'admin',
  },
  {
    id: 'endpoint4',
    method: 'GET',
    path: `${API_BASE_URL}/endpoint4`,
    description: 'List Users',
    requiredGroup: 'admin',
  },
];

export interface TestResult {
  status: 'success' | 'forbidden' | 'error';
  statusCode: number;
  message: string;
  response?: Record<string, unknown>;
  authHeader?: string;
}
