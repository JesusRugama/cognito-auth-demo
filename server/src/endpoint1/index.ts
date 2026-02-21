import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ok } from '../shared/response';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return ok({
    endpoint: 'endpoint1',
    method: event.httpMethod,
    message: "Read User's addresses list — action permitted",
    requiredScope: 'myapi/read',
    timestamp: new Date().toISOString(),
    requestId: event.requestContext.requestId,
  });
};
