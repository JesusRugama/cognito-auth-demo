import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ok } from '../shared/response';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return ok({
    endpoint: 'endpoint3',
    method: event.httpMethod,
    message: 'Update Address — action permitted',
    requiredGroup: 'admin',
    timestamp: new Date().toISOString(),
    requestId: event.requestContext.requestId,
  });
};
