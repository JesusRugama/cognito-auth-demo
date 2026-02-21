import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ok } from '../shared/response';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return ok({
    endpoint: 'endpoint2',
    method: event.httpMethod,
    message: 'Create New Address — action permitted',
    requiredScope: 'myapi/write',
    timestamp: new Date().toISOString(),
    requestId: event.requestContext.requestId,
  });
};
