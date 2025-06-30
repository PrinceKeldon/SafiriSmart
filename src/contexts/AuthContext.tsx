
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  company: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      // TODO: Verify token with backend when backend is deployed
      // For now, use mock data if token exists
      setToken(storedToken);
      setUser({
        id: '1',
        name: 'Demo Operator',
        email: 'demo@safariexperts.com',
        company: 'Safari Experts Ltd'
      });
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // TODO: Replace with actual backend API call
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });
      
      // Mock successful login for demo@safariexperts.com / password123
      if (email === 'demo@safariexperts.com' && password === 'password123') {
        const mockToken = 'mock_jwt_token_' + Date.now();
        const mockUser = {
          id: '1',
          name: 'Demo Operator',
          email: 'demo@safariexperts.com',
          company: 'Safari Experts Ltd'
        };
        
        setToken(mockToken);
        setUser(mockUser);
        localStorage.setItem('auth_token', mockToken);
        return { success: true };
      }

      return { success: false, error: 'Invalid email or password' };
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
  };

  const value = {
    user,
    token,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
