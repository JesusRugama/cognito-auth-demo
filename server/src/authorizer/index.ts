import {
  APIGatewayTokenAuthorizerEvent,
  APIGatewayAuthorizerResult,
} from 'aws-lambda';
import { createPublicKey } from 'crypto';
import { verify, JwtPayload } from 'jsonwebtoken';

const USER_POOL_ID = process.env.USER_POOL_ID!;
const REGION = process.env.AWS_REGION ?? 'us-east-1';
const CUSTOMER_CLIENT_ID = process.env.CUSTOMER_CLIENT_ID!;
const ADMIN_CLIENT_ID = process.env.ADMIN_CLIENT_ID!;

const JWKS_URL = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`;

interface JwksKey {
  kid: string;
  n: string;
  e: string;
  kty: string;
  use: string;
}

let cachedKeys: Map<string, string> | null = null;

async function getPublicKey(kid: string): Promise<string> {
  if (!cachedKeys) {
    const res = await fetch(JWKS_URL);
    const { keys }: { keys: JwksKey[] } = await res.json() as { keys: JwksKey[] };
    cachedKeys = new Map(
      keys.map((k) => [
        k.kid,
        createPublicKey({ key: { kty: k.kty, n: k.n, e: k.e }, format: 'jwk' })
          .export({ type: 'spki', format: 'pem' }) as string,
      ])
    );
  }
  const pem = cachedKeys.get(kid);
  if (!pem) throw new Error(`Public key not found for kid: ${kid}`);
  return pem;
}

function decodeHeader(token: string): { kid: string } {
  const [headerB64] = token.split('.');
  return JSON.parse(Buffer.from(headerB64, 'base64url').toString()) as { kid: string };
}

const ENDPOINT_PERMISSIONS: Record<string, { allowedGroups: string[]; allowedClients: string[] }> = {
  '/endpoint1': {
    allowedGroups: ['customer', 'admin'],
    allowedClients: [CUSTOMER_CLIENT_ID, ADMIN_CLIENT_ID],
  },
  '/endpoint2': {
    allowedGroups: ['viewer', 'admin'],
    allowedClients: [CUSTOMER_CLIENT_ID, ADMIN_CLIENT_ID],
  },
  '/endpoint3': {
    allowedGroups: ['admin'],
    allowedClients: [ADMIN_CLIENT_ID],
  },
  '/endpoint4': {
    allowedGroups: ['admin'],
    allowedClients: [ADMIN_CLIENT_ID],
  },
};

function buildPolicy(
  principalId: string,
  effect: 'Allow' | 'Deny',
  resource: string
): APIGatewayAuthorizerResult {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [{ Action: 'execute-api:Invoke', Effect: effect, Resource: resource }],
    },
  };
}

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  const token = event.authorizationToken?.replace(/^Bearer\s+/i, '');
  const resource = event.methodArn;

  if (!token) return buildPolicy('unknown', 'Deny', resource);

  try {
    const { kid } = decodeHeader(token);
    const pem = await getPublicKey(kid);

    const payload = verify(token, pem, {
      algorithms: ['RS256'],
      issuer: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`,
    }) as JwtPayload;

    const clientId: string = (payload['client_id'] as string) ?? '';
    const groups: string[] = (payload['cognito:groups'] as string[]) ?? [];
    const sub: string = payload.sub ?? 'unknown';

    // Derive endpoint path from the method ARN (arn:aws:execute-api:region:account:api/stage/METHOD/path)
    const arnParts = resource.split('/');
    const endpointPath = '/' + arnParts.slice(3).join('/');

    const permissions = ENDPOINT_PERMISSIONS[endpointPath];
    if (!permissions) return buildPolicy(sub, 'Deny', resource);

    const groupAllowed = groups.some((g) => permissions.allowedGroups.includes(g));
    const clientAllowed = permissions.allowedClients.includes(clientId);

    if (groupAllowed && clientAllowed) {
      return buildPolicy(sub, 'Allow', resource);
    }

    return buildPolicy(sub, 'Deny', resource);
  } catch {
    return buildPolicy('unknown', 'Deny', resource);
  }
};
