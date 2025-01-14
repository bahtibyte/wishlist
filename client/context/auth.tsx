import 'react-native-get-random-values';
import { createContext, useContext, useEffect, useState } from "react";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  GetUserCommand,
  ResendConfirmationCodeCommand
} from "@aws-sdk/client-cognito-identity-provider";

import { GET_USER, CREATE_USER } from '../graphql/users';
import { useAppData } from './app';

import { User } from '@/graphql/types';
import { useApolloClient } from '@apollo/client';
import { getAuthToken, refreshTokens, removeAuthToken, saveAuthToken } from '@/utils/tokens';
import { AuthToken } from '@/utils/tokens';

const CLIENT_ID = process.env.EXPO_PUBLIC_AWS_COGNITO_CLIENT_ID;
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.EXPO_PUBLIC_AWS_REGION
});

type AuthContextType = {
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, username: string, password: string) => Promise<void>;
  confirmSignUp: (username: string, code: string) => Promise<void>;
  resendConfirmEmail: (username: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

function getCreateUserInput(attributes: any, username: string) {
  const name = attributes.find((attr: any) => attr.Name === 'custom:name');
  const email = attributes.find((attr: any) => attr.Name === 'email');

  if (!name || !email) {
    throw new Error("Name or email not found in user attributes");
  }

  return {
    variables: {
      input: {
        profile_name: name.Value,
        username: username,
        email: email.Value,
        icon: process.env.EXPO_PUBLIC_DEFAULT_USER_ICON
      }
    }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [localPassword, setLocalPassword] = useState<string | null>(null);

  const { setUser } = useAppData();
  const client = useApolloClient();

  useEffect(() => {
    async function initAuth() {
      const token = await getAuthToken();
      await checkAuthStatus(token);

      // Once the auth status is checked, set the loading state to false.
      setIsLoading(false);
    }
    initAuth();
  }, []);

  const setOrCreateUser = async (attributes: any, username: string) => {
    try {
      console.log("[auth]: Attempting to get user data for:", username);
      const { data } = await client.query({
        query: GET_USER,
        variables: { username: username },
      });

      const user = data.user as User;
      if (user) {
        console.log("[auth]: valid user found, setting user:", user);
        setUser(user);
        return;
      }

      console.log("[auth]: user is not found, creating a new user.");
      {
        const { data } = await client.mutate({
          mutation: CREATE_USER,
          ...getCreateUserInput(attributes, username)
        });

        const user = data.createUser as User;
        if (!user) throw new Error("Failed to create initial user.");

        console.log("[auth]: new user created, setting user:", user);
        setUser(user);
      }
    } catch (err: any) {
      console.log("[auth]: error getting user from backend:", err);
      throw err;
    }
  }

  const checkAuthStatus = async (token: AuthToken | null, attemptRefresh: boolean = true) => {
    console.log("[auth]: Checking authentication status.");
    if (!token) {
      console.log("[auth]: Auth check failed, no tokens found.");
      await handleSignOut();
      return;
    }

    try {
      const response = await cognitoClient.send(new GetUserCommand({
        AccessToken: token.access
      }));

      if (response.Username) {
        console.log("[auth]: Tokens valid, logging into user.");
        setIsAuthenticated(true);
        await setOrCreateUser(response.UserAttributes, response.Username);
      }
    } catch (err: any) {
      console.log("[auth]: Error checking authentication status", err);
      if (attemptRefresh && err.name === 'NotAuthorizedException') {
        // If the error is due to expired tokens, attempt to refresh them and try again.
        await checkAuthStatus(await refreshTokens(), false);
      } else {
        console.log("[auth]: Error occurred during auth check, signing out.");
        await handleSignOut();
      }
    }
  }

  const handleSignIn = async (username: string, password: string) => {
    try {
      console.log("[auth]: Signing in with username and password.");
      const response = await cognitoClient.send(new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: CLIENT_ID,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
        },
      }));

      const authResult = response.AuthenticationResult;
      if (authResult && authResult.AccessToken && authResult.RefreshToken) {
        console.log("[auth]: Tokens received, saving and checking authentication status.");
        const token = {
          access: authResult.AccessToken,
          refresh: authResult.RefreshToken,
          expires: Math.floor(Date.now() / 1000) + authResult.ExpiresIn!
        };
        await saveAuthToken(token);
        await checkAuthStatus(token);
      }
    } catch (err: any) {
      // Save password so it can be used to sign in after verification.
      setLocalPassword(password); 
      throw err;
    }
  };

  const handleSignUp = async (name: string, email: string, username: string, password: string) => {
    try {
      console.log("[auth]: Signing up with username and password.");
      await cognitoClient.send(new SignUpCommand({
        ClientId: CLIENT_ID,
        Username: username,
        Password: password,
        UserAttributes: [
          { Name: "email", Value: email },
          { Name: "custom:name", Value: name }
        ],
      }));
      setLocalPassword(password);
    } catch (err: any) {
      throw err;
    }
  };

  const handleConfirmSignUp = async (username: string, code: string) => {
    try {
      console.log("[auth]: Confirming sign up with username and code.");
      await cognitoClient.send(new ConfirmSignUpCommand({
        ClientId: CLIENT_ID,
        Username: username,
        ConfirmationCode: code,
      }));

      // If the password was saved and the code was correct, sign in to account.
      if (localPassword) {
        console.log("[auth]: Local password saved, signing in to account.");
        await handleSignIn(username, localPassword);
      }
    } catch (err: any) {
      throw err;
    }
  };

  const handleResendConfirmEmail = async (username: string) => {
    try {
      console.log("[auth]: Resending confirmation email.");
      await cognitoClient.send(new ResendConfirmationCodeCommand({
        ClientId: CLIENT_ID,
        Username: username,
      }));
    } catch (err: any) {
      throw err;
    }
  };

  const handleSignOut = async () => {
    console.log("[auth]: Signing out.");
    setUser(null);
    await clearCache();
  };

  const clearCache = async () => {
    console.log("[auth]: Clearing cache.");
    await removeAuthToken();
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated,
        signIn: handleSignIn,
        signUp: handleSignUp,
        confirmSignUp: handleConfirmSignUp,
        resendConfirmEmail: handleResendConfirmEmail,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);