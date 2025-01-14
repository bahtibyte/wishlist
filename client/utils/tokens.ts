import { CognitoIdentityProviderClient, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_EXPIRATION_BUFFER = 3600; // 1 hour

const CLIENT_ID = process.env.EXPO_PUBLIC_AWS_COGNITO_CLIENT_ID;
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.EXPO_PUBLIC_AWS_REGION
});

export type AuthToken = {
  access: string;
  refresh: string;
  expires: number;
}

export async function saveAuthToken(token: AuthToken) {
  await AsyncStorage.setItem('accessToken', token.access!);
  await AsyncStorage.setItem('refreshToken', token.refresh!);
  await AsyncStorage.setItem('expires', token.expires!.toString());
}

export async function getAuthToken(): Promise<AuthToken | null> {
  const accessToken = await AsyncStorage.getItem('accessToken');
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  const expires = await AsyncStorage.getItem('expires');

  if (!accessToken || !refreshToken || !expires) {
    return null;
  }

  return {
    access: accessToken,
    refresh: refreshToken,
    expires: parseInt(expires)
  }
}

export async function removeAuthToken() {
  await AsyncStorage.removeItem('accessToken');
  await AsyncStorage.removeItem('refreshToken');
  await AsyncStorage.removeItem('expires');
}

export const refreshTokens = async (): Promise<AuthToken | null> => {
  console.log("[tokens]: Refreshing user tokens.");
  const token = await getAuthToken();
  if (!token) return null; // There is no token to refresh.

  try {
    const response = await cognitoClient.send(new InitiateAuthCommand({
      AuthFlow: "REFRESH_TOKEN_AUTH",
      ClientId: CLIENT_ID,
      AuthParameters: {
        REFRESH_TOKEN: token.refresh
      },
    }));

    const authResult = response.AuthenticationResult;
    if (!authResult || !authResult.AccessToken || !authResult.ExpiresIn) {
      throw new Error("[tokens]: Invalid refresh token response from Cognito.");
    }

    console.log("[auth]: Tokens refreshed successfully, updating access token.");
    const newToken: AuthToken = {
      access: authResult.AccessToken,
      refresh: token.refresh,
      expires: Math.floor(Date.now() / 1000) + authResult.ExpiresIn
    };

    await saveAuthToken(newToken);
    return newToken;
  } catch (err: any) {
    throw err;
  }
}

export const getAuthorizationHeader = async (): Promise<{ Authorization: string }> => {
  const token = await getAuthToken();

  // If the token is about to expire, refresh it and return the new authorization header.
  if (shouldRefreshTokens(token)) {
    return createAuthorizationHeader(await refreshTokens());
  }

  return createAuthorizationHeader(token);
}

function createAuthorizationHeader(token: AuthToken | null): { Authorization: string } {
  if (!token) return { Authorization: "" };

  return {
    Authorization: `Bearer ${token.access}`
  }
}

function shouldRefreshTokens(token: AuthToken | null): boolean {
  if (!token) return false;
  return token.expires - TOKEN_EXPIRATION_BUFFER < Math.floor(Date.now() / 1000);
}
