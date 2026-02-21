import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ok } from '../shared/response';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return ok({
    endpoint: 'endpoint4',
    method: event.httpMethod,
    message: 'List Users — action permitted',
    requiredGroup: 'admin',
    timestamp: new Date().toISOString(),
    requestId: event.requestContext.requestId,
  });
};
