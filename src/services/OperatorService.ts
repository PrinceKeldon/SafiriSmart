
import { OperatorProfile, OperatorProfileUpdate } from '@/types/operator';
import { supabase } from "@/integrations/supabase/client";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export class OperatorService {
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
      // For demo purposes, return the first operator in the database
      const { data, error } = await supabase
        .from('operators')
        .select('id, name, email, company, role, specializations, is_active')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching current operator:', error);
        return {
          success: false,
          data: {} as any,
          errors: [error.message]
        };
      }

      if (!data) {
        return {
          success: false,
          data: {} as any,
          errors: ['No operator found']
        };
      }

      return {
        success: true,
        data: {
          id: data.id,
          name: data.name,
          email: data.email,
          company: data.company,
          role: data.role,
          specializations: data.specializations || [],
          is_active: data.is_active || false
        }
      };
    } catch (error) {
      console.error('Unexpected error fetching current operator:', error);
      return {
        success: false,
        data: {} as any,
        errors: ['An unexpected error occurred']
      };
    }
  }

  async getOperatorProfile(): Promise<ApiResponse<OperatorProfile>> {
    try {
      // For demo purposes, get the first operator profile
      const { data, error } = await supabase
        .from('operators')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching operator profile:', error);
        return {
          success: false,
          data: {} as OperatorProfile,
          errors: [error.message]
        };
      }

      if (!data) {
        return {
          success: false,
          data: {} as OperatorProfile,
          errors: ['No operator profile found']
        };
      }

      return {
        success: true,
        data: data as OperatorProfile
      };
    } catch (error) {
      console.error('Unexpected error fetching operator profile:', error);
      return {
        success: false,
        data: {} as OperatorProfile,
        errors: ['An unexpected error occurred']
      };
    }
  }

  async updateOperatorProfile(profileData: OperatorProfileUpdate): Promise<ApiResponse<OperatorProfile>> {
    try {
      // For demo purposes, update the first operator in the database
      const { data: currentOperator, error: fetchError } = await supabase
        .from('operators')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching operator for update:', fetchError);
        return {
          success: false,
          data: {} as OperatorProfile,
          errors: [fetchError.message]
        };
      }

      if (!currentOperator) {
        return {
          success: false,
          data: {} as OperatorProfile,
          errors: ['No operator found to update']
        };
      }

      const { data, error } = await supabase
        .from('operators')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentOperator.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating operator profile:', error);
        return {
          success: false,
          data: {} as OperatorProfile,
          errors: [error.message]
        };
      }

      // Notify admin service of the update
      this.notifyAdminService(data);

      return {
        success: true,
        data: data as OperatorProfile
      };
    } catch (error) {
      console.error('Unexpected error updating operator profile:', error);
      return {
        success: false,
        data: {} as OperatorProfile,
        errors: ['An unexpected error occurred']
      };
    }
  }

  private notifyAdminService(updatedOperator: any) {
    // Dispatch a custom event to notify other parts of the application
    window.dispatchEvent(new CustomEvent('operatorProfileUpdated', {
      detail: updatedOperator
    }));
  }

  // Static method to get updated operator data for admin dashboard
  static async getUpdatedOperators(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('operators')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching updated operators:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching updated operators:', error);
      return [];
    }
  }
}

export const operatorService = new OperatorService();
