
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
  loginWithGoogle: (expectedRole?: 'operator' | 'admin') => Promise<{ success: boolean; error?: string }>;
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
    console.log('🚀 SIGNUP: Starting signup process for:', email);
    
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

      console.log('📋 SIGNUP: Edge function response:', { 
        hasData: !!data, 
        hasError: !!error,
        dataSuccess: data?.success,
        dataMessage: data?.message
      });

      if (error) {
        console.error('❌ SIGNUP: Edge function error:', error);
        
        // Handle specific error cases
        if (error.message?.includes('Failed to send') || error.message?.includes('FunctionsHttpError')) {
          return { 
            success: false, 
            error: 'Unable to connect to signup service. Please ensure the backend is deployed and try again.' 
          };
        }
        
        return { success: false, error: error.message };
      }

      if (!data?.success) {
        console.error('❌ SIGNUP: Signup failed:', data?.message);
        return { success: false, error: data?.message || 'Signup failed' };
      }

      console.log('✅ SIGNUP: Signup successful for:', email);
      return { success: true };
    } catch (error) {
      console.error('💥 SIGNUP: Unexpected error:', error);
      
      // Handle network/connection errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return { 
          success: false, 
          error: 'Network error. Please check your connection and try again.' 
        };
      }
      
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
      // Use Supabase's built-in signInWithPassword instead of edge function
      console.log('🔐 LOGIN: Attempting authentication with Supabase Auth for:', email);
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('📋 LOGIN: Supabase Auth response:', { 
        hasData: !!authData, 
        hasUser: !!authData.user,
        hasSession: !!authData.session,
        error: authError?.message,
        userEmail: authData.user?.email
      });

      if (authError) {
        console.error('❌ LOGIN: Authentication error:', authError);
        return { success: false, error: authError.message };
      }

      if (!authData.user || !authData.session) {
        console.error('❌ LOGIN: No user or session returned from auth');
        return { success: false, error: 'Authentication failed' };
      }

      // Check if operator exists and has correct role
      console.log('🔍 LOGIN: Checking operator profile for:', authData.user.email);
      
      const { data: operator, error: operatorError } = await supabase
        .from('operators')
        .select('*')
        .eq('email', authData.user.email)
        .eq('is_active', true)
        .single();

      if (operatorError || !operator) {
        console.error('❌ LOGIN: Operator lookup error:', operatorError);
        // Sign out the user since they don't have a valid operator profile
        await supabase.auth.signOut();
        return { success: false, error: 'No active operator profile found for this email' };
      }

      // Check if the operator's role matches the expected role for this login portal
      console.log('🔒 LOGIN: Role validation check:', {
        operatorRole: operator.role,
        expectedRole,
        rolesMatch: operator.role === expectedRole
      });

      if (operator.role !== expectedRole) {
        console.error('❌ LOGIN: Role mismatch detected:', {
          email: authData.user.email,
          operatorRole: operator.role,
          expectedRole,
          portalType: expectedRole === 'admin' ? 'Admin Portal' : 'Operator Portal'
        });
        
        // Sign out the user since they're trying to access wrong portal
        await supabase.auth.signOut();
        return { success: false, error: `Access denied. This portal is for ${expectedRole}s only.` };
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

  const loginWithGoogle = async (expectedRole: 'operator' | 'admin' = 'operator') => {
    console.log('🚀 GOOGLE LOGIN: Starting Google login process', {
      expectedRole,
      timestamp: new Date().toISOString()
    });
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${expectedRole === 'admin' ? '/admin/dashboard' : '/dashboard'}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) {
        console.error('❌ GOOGLE LOGIN: OAuth error:', error);
        return { success: false, error: error.message };
      }

      console.log('🎉 GOOGLE LOGIN: OAuth redirect initiated');
      return { success: true };
    } catch (error) {
      console.error('💥 GOOGLE LOGIN: Unexpected error:', {
        expectedRole,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error
      });
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Google login failed. Please try again.' 
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
    loginWithGoogle,
    signup,
    logout,
    isLoading,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
