import 'react-native-get-random-values';
import { createContext, useContext, useEffect, useState } from "react";
import { 
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  GlobalSignOutCommand
} from "@aws-sdk/client-cognito-identity-provider";

const cognitoClient = new CognitoIdentityProviderClient({
  region: "us-east-2"
});

const CLIENT_ID = 'CLIENT_ID';

type AuthContextType = {
  isAuthenticated: boolean;
  user: any | null;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string, email: string) => Promise<void>;
  confirmSignUp: (username: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (username: string, password: string) => {
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: CLIENT_ID,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
        },
      });

      const response = await cognitoClient.send(command);
      if (response.AuthenticationResult?.AccessToken) {
        setIsAuthenticated(true);
        setUser({ username }); // You can decode the JWT token for more user info
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
    try {
      const command = new GlobalSignOutCommand({
        AccessToken: user?.accessToken
      });
      
      await cognitoClient.send(command);
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
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