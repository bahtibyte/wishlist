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

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.EXPO_PUBLIC_AWS_REGION
});

const CLIENT_ID = process.env.EXPO_PUBLIC_AWS_COGNITO_CLIENT_ID;

type AuthContextType = {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: any | null;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (email: string, username: string, password: string) => Promise<void>;
  confirmSignUp: (username: string, code: string) => Promise<void>;
  resendConfirmEmail: (username: string) => Promise<void>;
  signOut: () => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true);
  const [localPassword, setLocalPassword] = useState<string | null>(null);

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

      setLocalPassword(password); // Save password even if wrong, for verification.
      if (response.AuthenticationResult?.AccessToken) {
        await saveAccessToken(response.AuthenticationResult?.AccessToken);
        setUser(username);
        setIsAuthenticated(true);
        setLocalPassword(null);
      }
    } catch (err: any) {
      throw err;
    }
  };

  const handleSignUp = async (email: string, username: string, password: string) => {
    try {
      const response = await cognitoClient.send(new SignUpCommand({
        ClientId: CLIENT_ID,
        Username: username,
        Password: password,
        UserAttributes: [
          { Name: "email", Value: email }
        ],
      }));
      setLocalPassword(password);
    } catch (err: any) {
      throw err;
    }
  };

  const handleConfirmSignUp = async (username: string, code: string) => {
    try {
      await cognitoClient.send(new ConfirmSignUpCommand({
        ClientId: CLIENT_ID,
        Username: username,
        ConfirmationCode: code,
      }));

      // If the password was saved and the code was correct, sign in to account.
      if (localPassword) {
        await handleSignIn(username, localPassword);
      }
    } catch (err: any) {
      throw err;
    }
  };

  const handleResendConfirmEmail = async (username: string) => {
    try {
      await cognitoClient.send(new ResendConfirmationCodeCommand({
        ClientId: CLIENT_ID,
        Username: username,
      }));
    } catch (err: any) {
      throw err;
    }
  };

  const handleSignOut = async () => {
    await removeAccessToken();
    setIsAuthenticated(false);
    setUser(null);
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
        resendConfirmEmail: handleResendConfirmEmail,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);