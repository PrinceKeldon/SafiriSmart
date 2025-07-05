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
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          // Fetch operator details from the operators table
          setTimeout(async () => {
            await fetchOperatorDetails(session.user.email!);
          }, 0);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchOperatorDetails(session.user.email!);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchOperatorDetails = async (email: string) => {
    try {
      const { data: operator, error } = await supabase
        .from('operators')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (error || !operator) {
        console.error('Failed to fetch operator details:', error);
        setUser(null);
        // If user is not active or doesn't exist, sign them out
        await supabase.auth.signOut();
        return;
      }

      setUser({
        id: operator.id,
        name: operator.name,
        email: operator.email,
        company: operator.company,
        role: operator.role,
        specializations: operator.specializations || []
      });
    } catch (error) {
      console.error('Error fetching operator details:', error);
      setUser(null);
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
    try {
      console.log('Attempting login for email:', email, 'with expected role:', expectedRole);
      
      // First, try to sign in with Supabase Auth directly
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Supabase Auth response:', { 
        hasData: !!data, 
        hasUser: !!data?.user, 
        hasSession: !!data?.session,
        error: error?.message,
        errorCode: error?.code,
        fullError: error
      });

      if (error) {
        console.error('Supabase Auth login error:', error);
        // Return the actual Supabase error message for better debugging
        return { success: false, error: `Auth Error: ${error.message} (Code: ${error.code || 'unknown'})` };
      }

      if (!data.user || !data.session) {
        console.error('No user or session returned from Supabase Auth');
        return { success: false, error: 'Authentication failed - no user or session returned' };
      }

      console.log('Supabase Auth login successful, checking operator record...');

      // After successful auth, check if operator exists and is active
      const { data: operator, error: operatorError } = await supabase
        .from('operators')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (operatorError || !operator) {
        console.error('Operator check failed:', operatorError);
        // Sign out the user since they don't have a valid operator record
        await supabase.auth.signOut();
        return { success: false, error: 'No active operator account found for this email' };
      }

      // Check if the operator's role matches the expected role for this login portal
      if (operator.role !== expectedRole) {
        console.error(`Role mismatch: expected ${expectedRole}, got ${operator.role}`);
        // Immediately sign them out from Supabase Auth
        await supabase.auth.signOut();
        return { success: false, error: `Access denied. This portal is for ${expectedRole}s.` };
      }

      console.log('Login successful for operator:', operator.name, 'with role:', operator.role);
      // User and session will be set by the auth state change listener
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed. Please try again.' 
      };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin';
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
