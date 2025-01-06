import { createContext, useContext, useEffect, useState } from "react";
import { Amplify } from "aws-amplify";
import { signIn, signUp, confirmSignUp, signOut, getCurrentUser } from "aws-amplify/auth";

// Configures AWS Authentication.
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'YOUR_USER_POOL_ID',
      userPoolClientId: 'YOUR_CLIENT_ID',
    }
  }
});

type AuthContextType = {
  isAuthenticated: boolean | undefined;
  user: any | null;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string, email: string) => Promise<void>;
  confirmSignUp: (username: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);
  const [user, setUser] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const user = await getCurrentUser();
      setUser(user);
      setIsAuthenticated(true);
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
    }
  }

  const handleSignIn = async (username: string, password: string) => {
    try {
      const { isSignedIn, nextStep } = await signIn({ username, password });
      if (isSignedIn) {
        const user = await getCurrentUser();
        setUser(user);
        setIsAuthenticated(true);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'Error signing in');
      throw err;
    }
  };

  const handleSignUp = async (username: string, password: string, email: string) => {
    try {
      await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email,
          },
        },
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error signing up');
      throw err;
    }
  };

  const handleConfirmSignUp = async (username: string, code: string) => {
    try {
      await confirmSignUp({ username, confirmationCode: code });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error confirming sign up');
      throw err;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error signing out');
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
  )
}

export const useAuth = () => useContext(AuthContext);