
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

interface OperatorWithDocuments extends Operator {
  documents?: {
    certificate_of_incorporation?: { url: string; valid: boolean; type: string };
    business_permit?: { url: string; valid: boolean; type: string };
    kato_membership?: { url: string; valid: boolean; type: string };
  };
}

class AdminService {
  private validateDocumentUrl(url: string | null, expectedType: 'pdf' | 'image' | 'url'): { valid: boolean; type: string } {
    if (!url) return { valid: false, type: 'missing' };
    
    const isSupabaseUrl = url.includes('supabase');
    
    switch (expectedType) {
      case 'pdf':
        return {
          valid: isSupabaseUrl && (url.includes('.pdf') || url.includes('pdf-uploads')),
          type: 'pdf'
        };
      case 'image':
        return {
          valid: isSupabaseUrl && (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('image-uploads')),
          type: 'image'
        };
      case 'url':
        try {
          const urlObj = new URL(url);
          return {
            valid: (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') && !isSupabaseUrl,
            type: 'external_url'
          };
        } catch {
          return { valid: false, type: 'invalid_url' };
        }
      default:
        return { valid: false, type: 'unknown' };
    }
  }

  private processOperatorDocuments(operator: Operator): OperatorWithDocuments {
    const documents = {
      certificate_of_incorporation: this.validateDocumentUrl(operator.certificate_of_incorporation_url, 'pdf'),
      business_permit: this.validateDocumentUrl(operator.business_permit_url, 'image'),
      kato_membership: this.validateDocumentUrl(operator.kato_membership_url, 'url')
    };

    return {
      ...operator,
      documents: {
        certificate_of_incorporation: operator.certificate_of_incorporation_url ? {
          url: operator.certificate_of_incorporation_url,
          ...documents.certificate_of_incorporation
        } : undefined,
        business_permit: operator.business_permit_url ? {
          url: operator.business_permit_url,
          ...documents.business_permit
        } : undefined,
        kato_membership: operator.kato_membership_url ? {
          url: operator.kato_membership_url,
          ...documents.kato_membership
        } : undefined
      }
    };
  }

  async getOperators(): Promise<ApiResponse<OperatorWithDocuments[]>> {
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

      if (!data.success) {
        return data;
      }

      // Process each operator to include document validation
      const processedOperators = data.data.map((operator: Operator) => 
        this.processOperatorDocuments(operator)
      );

      return {
        success: true,
        data: processedOperators
      };
    } catch (error) {
      console.error('Unexpected error fetching operators:', error);
      return {
        success: false,
        data: [],
        errors: ['An unexpected error occurred']
      };
    }
  }

  async getOperatorById(id: string): Promise<ApiResponse<OperatorWithDocuments | null>> {
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

      if (!data) {
        return {
          success: true,
          data: null
        };
      }

      const processedOperator = this.processOperatorDocuments(data);

      return {
        success: true,
        data: processedOperator
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

  async approveOperatorDocuments(id: string, notes?: string): Promise<ApiResponse<Operator>> {
    return this.updateOperator(id, { 
      updated_at: new Date().toISOString()
    });
  }

  async rejectOperatorDocuments(id: string, reason: string): Promise<ApiResponse<Operator>> {
    return this.updateOperator(id, { 
      updated_at: new Date().toISOString()
    });
  }

  async downloadDocument(url: string): Promise<void> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = this.getFileNameFromUrl(url);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  }

  private getFileNameFromUrl(url: string): string {
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    return fileName.replace(/^\d+-/, '') || 'document';
  }
}

export const adminService = new AdminService();
