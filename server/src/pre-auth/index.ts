import { PreAuthenticationTriggerHandler } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  AdminListGroupsForUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const cognito = new CognitoIdentityProviderClient({});
const CUSTOMER_CLIENT_ID = process.env.CUSTOMER_CLIENT_ID!;
const ADMIN_CLIENT_ID = process.env.ADMIN_CLIENT_ID!;

export const handler: PreAuthenticationTriggerHandler = async (event) => {
  const clientId = event.callerContext.clientId;
  const username = event.userName;
  const userPoolId = event.userPoolId;

  const { Groups = [] } = await cognito.send(
    new AdminListGroupsForUserCommand({ Username: username, UserPoolId: userPoolId })
  );

  const groupNames = Groups.map((g: { GroupName?: string }) => g.GroupName ?? '');
  const isAdmin = groupNames.includes('admin');

  if (clientId === ADMIN_CLIENT_ID && !isAdmin) {
    throw new Error('Only admin users can access the admin app.');
  }

  const isCustomer = groupNames.includes('customer');
  if (clientId === CUSTOMER_CLIENT_ID && !isCustomer && !isAdmin) {
    throw new Error('User is not assigned to any valid group.');
  }

  return event;
};
