export interface Endpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  requiredScope: string;
  simulateUrl: string;
}

export const API_ENDPOINTS: Endpoint[] = [
  {
    id: 'endpoint1',
    method: 'GET',
    path: '/api/endpoint1',
    description: 'Read Users List',
    requiredScope: 'myapi/read',
    simulateUrl: 'https://httpbin.org/status/200',
  },
  {
    id: 'endpoint2',
    method: 'POST',
    path: '/api/endpoint2',
    description: 'Create New User',
    requiredScope: 'myapi/write',
    simulateUrl: 'https://httpbin.org/status/200',
  },
  {
    id: 'endpoint3',
    method: 'PUT',
    path: '/api/endpoint3',
    description: 'Update User',
    requiredScope: 'myapi/write',
    simulateUrl: 'https://httpbin.org/status/200',
  },
  {
    id: 'endpoint4',
    method: 'DELETE',
    path: '/api/endpoint4',
    description: 'Delete Record',
    requiredScope: 'myapi/admin',
    simulateUrl: 'https://httpbin.org/status/200',
  },
];

export interface TestResult {
  status: 'success' | 'forbidden' | 'error';
  statusCode: number;
  message: string;
  response?: unknown;
  authHeader?: string;
}
