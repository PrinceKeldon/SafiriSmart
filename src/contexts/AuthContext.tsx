
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
      // Simulate API call to verify token and get user data
      mockGetUserData(storedToken)
        .then((userData) => {
          setToken(storedToken);
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
        });
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await mockLogin(email, password);
      
      if (response.success) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('auth_token', response.token);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
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

// Mock API functions
const mockLogin = async (email: string, password: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock successful login for demo@tourmaster.com / password123
  if (email === 'demo@tourmaster.com' && password === 'password123') {
    return {
      success: true,
      token: 'mock_jwt_token_' + Date.now(),
      user: {
        id: '1',
        name: 'John Safari',
        email: 'demo@tourmaster.com',
        company: 'Safari Adventures Ltd'
      }
    };
  }

  // Mock failed login
  return {
    success: false,
    error: 'Invalid email or password'
  };
};

const mockGetUserData = async (token: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Return mock user data for valid token
  if (token.startsWith('mock_jwt_token_')) {
    return {
      id: '1',
      name: 'John Safari',
      email: 'demo@tourmaster.com',
      company: 'Safari Adventures Ltd'
    };
  }

  throw new Error('Invalid token');
};
