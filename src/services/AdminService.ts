
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

type Operator = Tables<'operators'>;
type OperatorInsert = TablesInsert<'operators'>;
type OperatorUpdate = TablesUpdate<'operators'>;

class AdminService {
  async getOperators(): Promise<ApiResponse<Operator[]>> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operators', {
        method: 'GET'
      });

      if (error) {
        console.error('Error fetching operators:', error);
        return {
          success: false,
          data: [],
          errors: [error.message]
        };
      }

      return data;
    } catch (error) {
      console.error('Unexpected error fetching operators:', error);
      return {
        success: false,
        data: [],
        errors: ['An unexpected error occurred']
      };
    }
  }

  async createOperator(operatorData: {
    name: string;
    email: string;
    company: string;
    specializations?: string[];
    role?: string;
  }): Promise<ApiResponse<Operator & { temporary_password?: string }>> {
    try {
      const { data, error } = await supabase.functions.invoke('admin-operators', {
        method: 'POST',
        body: JSON.stringify(operatorData)
      });

      if (error) {
        console.error('Error creating operator:', error);
        return {
          success: false,
          data: {} as Operator & { temporary_password?: string },
          errors: [error.message]
        };
      }

      return data;
    } catch (error) {
      console.error('Unexpected error creating operator:', error);
      return {
        success: false,
        data: {} as Operator & { temporary_password?: string },
        errors: ['An unexpected error occurred']
      };
    }
  }

  async getOperator(id: string): Promise<ApiResponse<Operator | null>> {
    try {
      const { data, error } = await supabase
        .from('operators')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching operator:', error);
        return {
          success: false,
          data: null,
          errors: [error.message]
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Unexpected error fetching operator:', error);
      return {
        success: false,
        data: null,
        errors: ['An unexpected error occurred']
      };
    }
  }

  async updateOperator(id: string, operatorData: Partial<OperatorUpdate>): Promise<ApiResponse<Operator>> {
    try {
      const { data, error } = await supabase
        .from('operators')
        .update(operatorData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating operator:', error);
        return {
          success: false,
          data: {} as Operator,
          errors: [error.message]
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Unexpected error updating operator:', error);
      return {
        success: false,
        data: {} as Operator,
        errors: ['An unexpected error occurred']
      };
    }
  }

  async deleteOperator(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('operators')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting operator:', error);
        return {
          success: false,
          data: undefined,
          errors: [error.message]
        };
      }

      return {
        success: true,
        data: undefined
      };
    } catch (error) {
      console.error('Unexpected error deleting operator:', error);
      return {
        success: false,
        data: undefined,
        errors: ['An unexpected error occurred']
      };
    }
  }

  async toggleOperatorStatus(id: string, isActive: boolean): Promise<ApiResponse<Operator>> {
    return this.updateOperator(id, { is_active: isActive });
  }
}

export const adminService = new AdminService();
