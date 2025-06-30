
import { supabase } from '@/integrations/supabase/client';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

interface Operator {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  specializations: string[];
  is_active: boolean;
  created_at?: string;
}

class ApiService {
  // Authentication - now using Supabase directly
  async getCurrentOperator(): Promise<ApiResponse<{
    id: string;
    name: string;
    email: string;
    company: string;
    role: string;
    specializations: string[];
    is_active: boolean;
  }>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data: operator, error } = await supabase
        .from('operators')
        .select('*')
        .eq('email', user.email)
        .eq('is_active', true)
        .single();

      if (error || !operator) {
        throw new Error('Operator not found');
      }

      return {
        success: true,
        data: {
          id: operator.id,
          name: operator.name,
          email: operator.email,
          company: operator.company,
          role: operator.role,
          specializations: operator.specializations || [],
          is_active: operator.is_active
        }
      };
    } catch (error) {
      return {
        success: false,
        data: {} as any,
        message: error instanceof Error ? error.message : 'Failed to get current operator'
      };
    }
  }

  // Admin Operations - using Supabase directly
  async getOperators(): Promise<ApiResponse<Operator[]>> {
    try {
      const { data: operators, error } = await supabase
        .from('operators')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: operators || []
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Failed to fetch operators'
      };
    }
  }

  async createOperator(operatorData: {
    name: string;
    email: string;
    company: string;
    specializations?: string[];
  }): Promise<ApiResponse<Operator & { temporary_password?: string }>> {
    try {
      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!';

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: operatorData.email,
        password: tempPassword,
        email_confirm: true
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // Create operator in operators table
      const { data: operator, error: operatorError } = await supabase
        .from('operators')
        .insert({
          name: operatorData.name,
          email: operatorData.email,
          company: operatorData.company,
          specializations: operatorData.specializations || [],
          password_hash: 'managed_by_supabase_auth', // Placeholder since Supabase handles this
          role: 'operator',
          is_active: true
        })
        .select()
        .single();

      if (operatorError) {
        // If operator creation fails, clean up the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error(operatorError.message);
      }

      return {
        success: true,
        data: {
          ...operator,
          temporary_password: tempPassword
        }
      };
    } catch (error) {
      return {
        success: false,
        data: {} as any,
        message: error instanceof Error ? error.message : 'Failed to create operator'
      };
    }
  }

  // Leads - using Supabase directly
  async getLeads(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}): Promise<PaginatedResponse<any>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Get current operator
      const { data: operator } = await supabase
        .from('operators')
        .select('id, role')
        .eq('email', user.email)
        .single();

      if (!operator) {
        throw new Error('Operator not found');
      }

      let query = supabase.from('leads').select('*', { count: 'exact' });

      // If not admin, only show leads assigned to this operator
      if (operator.role !== 'admin') {
        query = query.eq('assigned_operator_id', operator.id);
      }

      // Apply filters
      if (params.status) {
        query = query.eq('status', params.status);
      }

      if (params.search) {
        query = query.or(`traveler_name.ilike.%${params.search}%,traveler_email.ilike.%${params.search}%`);
      }

      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to).order('created_at', { ascending: false });

      const { data: leads, error, count } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: leads || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        pagination: { page: 1, limit: 20, total: 0, total_pages: 0 },
      };
    }
  }

  async getLeadById(leadId: string): Promise<ApiResponse<any>> {
    try {
      const { data: lead, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: lead
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to fetch lead'
      };
    }
  }

  async updateLeadStatus(leadId: string, status: string): Promise<ApiResponse<any>> {
    try {
      const { data: lead, error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', leadId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: lead
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to update lead status'
      };
    }
  }

  async addLeadNote(leadId: string, note: string): Promise<ApiResponse<any>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data: operator } = await supabase
        .from('operators')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!operator) {
        throw new Error('Operator not found');
      }

      const { data: leadNote, error } = await supabase
        .from('lead_notes')
        .insert({
          lead_id: leadId,
          note,
          created_by: operator.id
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: leadNote
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to add lead note'
      };
    }
  }

  async updateLeadQuote(leadId: string, quotedPrice: number, quotedCurrency: string): Promise<ApiResponse<any>> {
    try {
      const { data: lead, error } = await supabase
        .from('leads')
        .update({ 
          quoted_price: quotedPrice, 
          quoted_currency: quotedCurrency 
        })
        .eq('id', leadId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: lead
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to update lead quote'
      };
    }
  }

  async getLeadNotes(leadId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data: notes, error } = await supabase
        .from('lead_notes')
        .select(`
          *,
          operator:operators(name)
        `)
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: notes || []
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Failed to fetch lead notes'
      };
    }
  }

  // Operator Profile - using Supabase directly
  async getOperatorProfile(): Promise<ApiResponse<any>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data: operator, error } = await supabase
        .from('operators')
        .select('*')
        .eq('email', user.email)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: operator
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to fetch operator profile'
      };
    }
  }

  async updateOperatorProfile(profileData: any): Promise<ApiResponse<any>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data: operator, error } = await supabase
        .from('operators')
        .update(profileData)
        .eq('email', user.email)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: operator
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to update operator profile'
      };
    }
  }

  // Operator Packages - using Supabase directly
  async getOperatorPackages(): Promise<ApiResponse<any[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data: operator } = await supabase
        .from('operators')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!operator) {
        throw new Error('Operator not found');
      }

      const { data: packages, error } = await supabase
        .from('operator_packages')
        .select('*')
        .eq('operator_id', operator.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: packages || []
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Failed to fetch operator packages'
      };
    }
  }

  async createOperatorPackage(packageData: any): Promise<ApiResponse<any>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data: operator } = await supabase
        .from('operators')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!operator) {
        throw new Error('Operator not found');
      }

      const { data: package_, error } = await supabase
        .from('operator_packages')
        .insert({
          ...packageData,
          operator_id: operator.id
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: package_
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to create operator package'
      };
    }
  }

  async updateOperatorPackage(packageId: string, packageData: any): Promise<ApiResponse<any>> {
    try {
      const { data: package_, error } = await supabase
        .from('operator_packages')
        .update(packageData)
        .eq('id', packageId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: package_
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Failed to update operator package'
      };
    }
  }

  async deleteOperatorPackage(packageId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('operator_packages')
        .delete()
        .eq('id', packageId);

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: undefined
      };
    } catch (error) {
      return {
        success: false,
        data: undefined,
        message: error instanceof Error ? error.message : 'Failed to delete operator package'
      };
    }
  }
}

export const apiService = new ApiService();
