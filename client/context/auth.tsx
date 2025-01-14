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
import AsyncStorage from '@react-native-async-storage/async-storage';

import { GET_USER, CREATE_USER } from '../graphql/users';
import { useAppData } from './app';

import { User } from '@/graphql/types';
import { useApolloClient } from '@apollo/client';

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.EXPO_PUBLIC_AWS_REGION
});

const CLIENT_ID = process.env.EXPO_PUBLIC_AWS_COGNITO_CLIENT_ID;

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

type AuthToken = {
  access: string;
  refresh: string;
}

async function saveAuthToken(token: AuthToken) {
  await AsyncStorage.setItem('accessToken', token.access!);
  await AsyncStorage.setItem('refreshToken', token.refresh!);
}

async function getAuthToken(): Promise<AuthToken | null> {
  const accessToken = await AsyncStorage.getItem('accessToken');
  const refreshToken = await AsyncStorage.getItem('refreshToken');

  if (!accessToken || !refreshToken) {
    return null;
  }

  return {
    access: accessToken,
    refresh: refreshToken
  }
}

async function removeAuthToken() {
  await AsyncStorage.removeItem('accessToken');
  await AsyncStorage.removeItem('refreshToken');
}

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
    checkAuthStatus();
  }, []);

  const setOrCreateUser = async (attributes: any, username: string) => {
    try {
      console.log("[auth]: Attempting to get user data for:", username);
      const { data } = await client.query({
        query: GET_USER,
        variables: {
          username: username
        },
      });

      const user = data.user as User;
      if (user) {
        console.log("[auth]: valid user found, setting user:", user);
        setUser(user);
      } else {
        console.log("[auth]: user is not found, creating a new user.");
        const { data } = await client.mutate({
          mutation: CREATE_USER,
          ...getCreateUserInput(attributes, username)
        });

        const newUser = data.createUser as User;
        if (newUser) {
          console.log("[auth]: new user created, setting user:", newUser);
          setUser(newUser);
        } else {
          throw new Error("Failed to create initial user.");
        }
      }
    } catch (err: any) {
      console.log("[auth]: error getting user from backend:", {
        message: err.message,
        networkError: err.networkError?.result,
        graphQLErrors: err.graphQLErrors
      });
      console.log("[auth]: signing out and clearing cache.");
      await handleSignOut();
    }
  }

  const checkAuthStatus = async (attemptRefresh: boolean = true) => {
    console.log("[auth]: Checking authentication status.");
    const token = await getAuthToken();
    try {
      if (token) {
        const response = await cognitoClient.send(new GetUserCommand({
          AccessToken: token.access
        }));
        if (response.Username) {
          console.log("[auth]: Tokens valid, logging into user.");
          setIsAuthenticated(true);
          await setOrCreateUser(response.UserAttributes, response.Username);
        }
      } else {
        console.log("[auth]: No token found, cache must be empty.");
      }
    } catch (err: any) {
      console.log("[auth]: Error checking authentication status", err);
      if (attemptRefresh && err.name === 'NotAuthorizedException') {
        await refreshTokens(); // Attempt to refresh tokens if not authorized.
      } else {
        console.log("[auth]: Token refresh attempt blocked, signing user out.");
        await handleSignOut(); // Fully sign out if not authorized.
      }
    } finally {
      setIsLoading(false);
    }
  }

  const refreshTokens = async () => {
    console.log("[auth]: Refreshing tokens.");
    const token = await getAuthToken();
    try {
      if (token) {
        const response = await cognitoClient.send(new InitiateAuthCommand({
          AuthFlow: "REFRESH_TOKEN_AUTH",
          ClientId: CLIENT_ID,
          AuthParameters: {
            REFRESH_TOKEN: token.refresh
          },
        }));
        const authResult = response.AuthenticationResult;
        if (authResult && authResult.AccessToken) {
          console.log("[auth]: Tokens refreshed successfully, updating access token.");
          await saveAuthToken({
            access: authResult.AccessToken,
            refresh: token.refresh
          });
          // Don't attempt to refresh again since tokens are refreshed.
          await checkAuthStatus(false);
        } else {
          console.log("[auth]: Response does not contain access token, clearing cache.");
          await handleSignOut();
        }
      } else {
        console.log("[auth]: No refresh token found, cache must be empty.");
      }
    } catch (err: any) {
      console.log("[auth]: Could not refresh tokens", err);
      await handleSignOut();
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

      setLocalPassword(password); // Save password even if wrong, for verification.

      const authResult = response.AuthenticationResult;
      if (authResult && authResult.AccessToken && authResult.RefreshToken) {
        console.log("[auth]: Tokens received, saving and checking authentication status.");
        await saveAuthToken({
          access: authResult.AccessToken,
          refresh: authResult.RefreshToken
        });
        await checkAuthStatus();
        setLocalPassword(null);
      }
    } catch (err: any) {
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
    console.log("[auth]: Signing out and clearing cache.");
    await removeAuthToken();
    setIsAuthenticated(false);
  };

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