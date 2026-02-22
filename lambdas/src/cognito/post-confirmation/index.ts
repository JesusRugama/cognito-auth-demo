import { PostConfirmationTriggerHandler } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const cognito = new CognitoIdentityProviderClient({});
const CUSTOMER_CLIENT_ID = process.env.CUSTOMER_CLIENT_ID!;
const ADMIN_CLIENT_ID = process.env.ADMIN_CLIENT_ID!;

/**
 * By default, assign a user role according to the client the user is created from.
 * In other types of setup the group would be assigned in a lambda behind the authorizer,
 * and the group could be part of the request instead.
 *
 * For showcasing purposes this is sufficient, but in production you'd disable
 * self-registration on the admin client (via a Pre Sign-Up trigger) to prevent
 * unauthorized privilege escalation.
 */
const CLIENT_GROUP_MAP: Record<string, string> = {
  [CUSTOMER_CLIENT_ID]: 'customer',
  [ADMIN_CLIENT_ID]: 'admin',
};

export const handler: PostConfirmationTriggerHandler = async (event) => {
  const group = CLIENT_GROUP_MAP[event.callerContext.clientId];

  if (group) {
    await cognito.send(
      new AdminAddUserToGroupCommand({
        UserPoolId: event.userPoolId,
        Username: event.userName,
        GroupName: group,
      })
    );
  }

  return event;
};