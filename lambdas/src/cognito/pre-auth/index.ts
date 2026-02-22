import { PreAuthenticationTriggerHandler } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  AdminListGroupsForUserCommand,
  ListUserPoolClientsCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const cognito = new CognitoIdentityProviderClient({});
const ADMIN_CLIENT_NAME = process.env.ADMIN_CLIENT_NAME!;

let cachedAdminClientId: string | null = null;

async function getAdminClientId(userPoolId: string): Promise<string> {
  if (cachedAdminClientId) return cachedAdminClientId;

  const { UserPoolClients = [] } = await cognito.send(
    new ListUserPoolClientsCommand({ UserPoolId: userPoolId })
  );

  const adminClient = UserPoolClients.find((c) => c.ClientName === ADMIN_CLIENT_NAME);
  if (!adminClient?.ClientId) {
    throw new Error(`Client "${ADMIN_CLIENT_NAME}" not found in pool`);
  }

  cachedAdminClientId = adminClient.ClientId;
  return cachedAdminClientId;
}

export const handler: PreAuthenticationTriggerHandler = async (event) => {
  const clientId = event.callerContext.clientId;
  const adminClientId = await getAdminClientId(event.userPoolId);

  if (clientId !== adminClientId) {
    return event;
  }

  const { Groups = [] } = await cognito.send(
    new AdminListGroupsForUserCommand({
      Username: event.userName,
      UserPoolId: event.userPoolId,
    })
  );

  const isAdmin = Groups.some((g) => g.GroupName === 'admin');

  if (!isAdmin) {
    throw new Error('Only admin users can access the admin app.');
  }

  return event;
};
