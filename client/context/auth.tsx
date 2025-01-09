import 'react-native-get-random-values';
import { createContext, useContext, useEffect, useState } from "react";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  GetUserCommand
} from "@aws-sdk/client-cognito-identity-provider";

import AsyncStorage from '@react-native-async-storage/async-storage';

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.EXPO_PUBLIC_AWS_REGION
});

const CLIENT_ID = process.env.EXPO_PUBLIC_AWS_COGNITO_CLIENT_ID;

type AuthContextType = {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: any | null;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string, email: string) => Promise<void>;
  confirmSignUp: (username: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

async function saveAccessToken(token: string) {
  await AsyncStorage.setItem('accessToken', token);
}

async function getAccessToken() {
  return await AsyncStorage.getItem('accessToken');
}

async function removeAccessToken() {
  await AsyncStorage.removeItem('accessToken');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = await getAccessToken();

    try {
      if (token) {
        const response = await cognitoClient.send(new GetUserCommand({
          AccessToken: token
        }));
        if (response.Username) {
          setUser(response.Username);
          setIsAuthenticated(true);
        }
      }
    } catch (err) {
      await removeAccessToken();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSignIn = async (username: string, password: string) => {
    try {
      const response = await cognitoClient.send(new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: CLIENT_ID,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
        },
      }));
      if (response.AuthenticationResult?.AccessToken) {
        await saveAccessToken(response.AuthenticationResult?.AccessToken);
        setUser(username);
        setIsAuthenticated(true);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const handleSignUp = async (username: string, password: string, email: string) => {
    try {
      const command = new SignUpCommand({
        ClientId: CLIENT_ID,
        Username: username,
        Password: password,
        UserAttributes: [
          { Name: "email", Value: email }
        ],
      });

      await cognitoClient.send(command);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const handleConfirmSignUp = async (username: string, code: string) => {
    try {
      const command = new ConfirmSignUpCommand({
        ClientId: CLIENT_ID,
        Username: username,
        ConfirmationCode: code,
      });

      await cognitoClient.send(command);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const handleSignOut = async () => {
    await removeAccessToken();
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated,
        user,
        signIn: handleSignIn,
        signUp: handleSignUp,
        confirmSignUp: handleConfirmSignUp,
        signOut: handleSignOut,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);