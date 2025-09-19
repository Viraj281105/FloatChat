import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('floatchat_token');
    const savedUser = localStorage.getItem('floatchat_user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('floatchat_token');
        localStorage.removeItem('floatchat_user');
      }
    }
    
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      // Mock authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockToken = `token_${Date.now()}`;
      const mockUser = {
        id: `user_${Date.now()}`,
        email: email,
        name: email.split('@')[0]
      };

      localStorage.setItem('floatchat_token', mockToken);
      localStorage.setItem('floatchat_user', JSON.stringify(mockUser));

      setToken(mockToken);
      setUser(mockUser);
    } catch (error) {
      throw new Error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      // Mock sign up
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Sign up successful for:', email);
    } catch (error) {
      throw new Error('Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const signOut = (): void => {
    localStorage.removeItem('floatchat_token');
    localStorage.removeItem('floatchat_user');
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    signIn,
    signUp,
    signOut,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};