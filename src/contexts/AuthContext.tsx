
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
      // First, try to sign in with Supabase Auth directly
      console.log('🔐 LOGIN: Attempting Supabase Auth signInWithPassword for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('📋 LOGIN: Supabase Auth response:', { 
        hasData: !!data, 
        hasUser: !!data?.user, 
        hasSession: !!data?.session,
        userEmail: data?.user?.email,
        error: error?.message,
        errorCode: error?.code,
        fullError: error
      });

      if (error) {
        console.error('❌ LOGIN: Supabase Auth login error:', error);
        return { success: false, error: `Auth Error: ${error.message} (Code: ${error.code || 'unknown'})` };
      }

      if (!data.user || !data.session) {
        console.error('❌ LOGIN: No user or session returned from Supabase Auth');
        return { success: false, error: 'Authentication failed - no user or session returned' };
      }

      console.log('✅ LOGIN: Supabase Auth login successful, checking operator record...');

      // After successful auth, check if operator exists and is active
      console.log('🔍 LOGIN: Querying operators table for email:', email);
      
      const { data: operator, error: operatorError } = await supabase
        .from('operators')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      console.log('📊 LOGIN: Operators table query result:', {
        email,
        hasOperator: !!operator,
        error: operatorError?.message,
        errorCode: operatorError?.code,
        operatorData: operator ? {
          id: operator.id,
          email: operator.email,
          role: operator.role,
          is_active: operator.is_active,
          name: operator.name
        } : null
      });

      if (operatorError || !operator) {
        console.error('❌ LOGIN: Operator check failed:', {
          email,
          error: operatorError?.message,
          errorCode: operatorError?.code,
          hasOperator: !!operator
        });
        
        console.log('🚪 LOGIN: Signing out user due to missing operator record');
        await supabase.auth.signOut();
        return { success: false, error: 'No active operator account found for this email' };
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
        
        console.log('🚪 LOGIN: Signing out user due to role mismatch');
        await supabase.auth.signOut();
        return { success: false, error: `Access denied. This portal is for ${expectedRole}s.` };
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
