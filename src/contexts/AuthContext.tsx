
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  specializations: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  login: (email: string, password: string, expectedRole?: 'operator' | 'admin') => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string, company: string, specializations?: string[]) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAdmin: () => boolean;
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Set up auth state listener and check for existing session
  useEffect(() => {
    console.log('🔧 AuthProvider: Setting up auth state listener');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', {
          event,
          userEmail: session?.user?.email,
          hasSession: !!session,
          hasUser: !!session?.user,
          timestamp: new Date().toISOString()
        });
        
        setSession(session);
        
        if (session?.user) {
          console.log('👤 Auth state change: User found, fetching operator details for:', session.user.email);
          // Fetch operator details from the operators table
          setTimeout(async () => {
            await fetchOperatorDetails(session.user.email!);
          }, 0);
        } else {
          console.log('❌ Auth state change: No user, clearing state');
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    console.log('🔍 AuthProvider: Checking for existing session');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📋 Existing session check:', {
        hasSession: !!session,
        userEmail: session?.user?.email,
        timestamp: new Date().toISOString()
      });
      
      setSession(session);
      if (session?.user) {
        console.log('👤 Existing session: User found, fetching operator details for:', session.user.email);
        fetchOperatorDetails(session.user.email!);
      } else {
        console.log('❌ Existing session: No user found');
        setIsLoading(false);
      }
    });

    return () => {
      console.log('🧹 AuthProvider: Cleaning up auth state listener');
      subscription.unsubscribe();
    };
  }, []);

  const fetchOperatorDetails = async (email: string) => {
    console.log('🔍 fetchOperatorDetails: Starting fetch for email:', email);
    
    try {
      const { data: operator, error } = await supabase
        .from('operators')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      console.log('📊 fetchOperatorDetails: Database query result:', {
        email,
        hasOperator: !!operator,
        error: error?.message,
        operatorData: operator ? {
          id: operator.id,
          email: operator.email,
          role: operator.role,
          is_active: operator.is_active,
          name: operator.name,
          company: operator.company
        } : null
      });

      if (error || !operator) {
        console.error('❌ fetchOperatorDetails: Failed to fetch operator details:', {
          email,
          error: error?.message,
          errorCode: error?.code,
          hasOperator: !!operator
        });
        
        setUser(null);
        console.log('🚪 fetchOperatorDetails: Signing out user due to missing/inactive operator record');
        await supabase.auth.signOut();
        return;
      }

      console.log('✅ fetchOperatorDetails: Successfully fetched operator, setting user state:', {
        id: operator.id,
        name: operator.name,
        email: operator.email,
        role: operator.role,
        company: operator.company,
        is_active: operator.is_active
      });

      setUser({
        id: operator.id,
        name: operator.name,
        email: operator.email,
        company: operator.company,
        role: operator.role,
        specializations: operator.specializations || []
      });
    } catch (error) {
      console.error('💥 fetchOperatorDetails: Unexpected error:', {
        email,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error
      });
      
      setUser(null);
      console.log('🚪 fetchOperatorDetails: Signing out user due to unexpected error');
      await supabase.auth.signOut();
    }
  };

  const signup = async (email: string, password: string, name: string, company: string, specializations: string[] = []) => {
    try {
      const { data, error } = await supabase.functions.invoke('operator-signup', {
        body: {
          email,
          password,
          name,
          company,
          specializations
        }
      });

      if (error) {
        console.error('Signup error:', error);
        return { success: false, error: error.message };
      }

      if (!data.success) {
        return { success: false, error: data.message || 'Signup failed' };
      }

      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Signup failed. Please try again.' 
      };
    }
  };

  const login = async (email: string, password: string, expectedRole: 'operator' | 'admin' = 'operator') => {
    console.log('🚀 LOGIN: Starting login process', {
      email,
      expectedRole,
      timestamp: new Date().toISOString()
    });
    
    try {
      // Use the auth-login edge function instead of direct Supabase auth
      console.log('🔐 LOGIN: Calling auth-login edge function for:', email);
      
      const { data, error } = await supabase.functions.invoke('auth-login', {
        body: {
          email,
          password
        }
      });

      console.log('📋 LOGIN: Auth-login edge function response:', { 
        hasData: !!data, 
        success: data?.success,
        error: error?.message || data?.message,
        hasOperatorData: !!data?.data?.operator
      });

      if (error) {
        console.error('❌ LOGIN: Edge function error:', error);
        return { success: false, error: `Login Error: ${error.message}` };
      }

      if (!data?.success) {
        console.error('❌ LOGIN: Login failed:', data?.message);
        return { success: false, error: data?.message || 'Login failed' };
      }

      const { access_token, operator } = data.data;

      if (!access_token || !operator) {
        console.error('❌ LOGIN: Missing access token or operator data');
        return { success: false, error: 'Authentication failed - missing data' };
      }

      // Check if the operator's role matches the expected role for this login portal
      console.log('🔒 LOGIN: Role validation check:', {
        operatorRole: operator.role,
        expectedRole,
        rolesMatch: operator.role === expectedRole
      });

      if (operator.role !== expectedRole) {
        console.error('❌ LOGIN: Role mismatch detected:', {
          email,
          operatorRole: operator.role,
          expectedRole,
          portalType: expectedRole === 'admin' ? 'Admin Portal' : 'Operator Portal'
        });
        
        return { success: false, error: `Access denied. This portal is for ${expectedRole}s only.` };
      }

      // Set the session using the access token from the edge function
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token: access_token // Using access_token as refresh_token for now
      });

      if (sessionError) {
        console.error('❌ LOGIN: Session setting error:', sessionError);
        return { success: false, error: 'Failed to establish session' };
      }

      console.log('🎉 LOGIN: Login successful for operator:', {
        name: operator.name,
        email: operator.email,
        role: operator.role,
        company: operator.company
      });
      
      // User and session will be set by the auth state change listener
      return { success: true };
    } catch (error) {
      console.error('💥 LOGIN: Unexpected login error:', {
        email,
        expectedRole,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed. Please try again.' 
      };
    }
  };

  const logout = async () => {
    console.log('🚪 LOGOUT: Starting logout process');
    
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      console.log('✅ LOGOUT: Logout successful');
    } catch (error) {
      console.error('❌ LOGOUT: Logout error:', error);
    }
  };

  const isAdmin = () => {
    const result = user?.role === 'admin';
    console.log('🔑 isAdmin check:', {
      userRole: user?.role,
      isAdmin: result
    });
    return result;
  };

  const value = {
    user,
    session,
    login,
    signup,
    logout,
    isLoading,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
