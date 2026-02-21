export interface Endpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  requiredScope: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export const API_ENDPOINTS: Endpoint[] = [
  {
    id: 'endpoint1',
    method: 'GET',
    path: `${API_BASE_URL}/endpoint1`,
    description: "Read User's addresses list",
    requiredScope: 'myapi/read',
  },
  {
    id: 'endpoint2',
    method: 'POST',
    path: `${API_BASE_URL}/endpoint2`,
    description: 'Create New Address',
    requiredScope: 'myapi/write',
  },
  {
    id: 'endpoint3',
    method: 'PUT',
    path: `${API_BASE_URL}/endpoint3`,
    description: 'Update Address',
    requiredScope: 'myapi/write',
  },
  {
    id: 'endpoint4',
    method: 'GET',
    path: `${API_BASE_URL}/endpoint4`,
    description: 'List Users',
    requiredScope: 'myapi/admin',
  },
];

export interface TestResult {
  status: 'success' | 'forbidden' | 'error';
  statusCode: number;
  message: string;
  response?: Record<string, unknown>;
  authHeader?: string;
}
