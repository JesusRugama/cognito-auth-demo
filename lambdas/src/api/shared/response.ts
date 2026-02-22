import { APIGatewayProxyResult } from 'aws-lambda';
import { CORS_HEADERS } from './cors';

export interface SuccessBody {
  endpoint: string;
  method: string;
  message: string;
  requiredGroup: string;
  timestamp: string;
  requestId: string;
}

export function ok(body: SuccessBody): APIGatewayProxyResult {
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ success: true, ...body }),
  };
}

export function error(statusCode: number, message: string): APIGatewayProxyResult {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({ success: false, message }),
  };
}
