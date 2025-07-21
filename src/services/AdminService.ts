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
    
    const isSupabaseUrl = url.includes('supabase.co') || url.includes('supabase');
    
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

  private async getSignedUrl(url: string): Promise<string> {
    try {
      // Extract bucket and path from the URL
      const urlParts = url.split('/');
      const bucketIndex = urlParts.findIndex(part => part === 'storage');
      if (bucketIndex === -1) return url;
      
      const pathParts = urlParts.slice(bucketIndex + 3); // Skip 'storage', 'v1', 'object'
      const bucketName = pathParts[0];
      const filePath = pathParts.slice(1).join('/');
      
      console.log('Getting signed URL for:', { bucketName, filePath });
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 3600); // 1 hour expiry
      
      if (error) {
        console.error('Error creating signed URL:', error);
        return url; // Return original URL if signing fails
      }
      
      return data.signedUrl;
    } catch (error) {
      console.error('Error processing URL for signing:', error);
      return url; // Return original URL if processing fails
    }
  }

  private async processOperatorDocuments(operator: Operator): Promise<OperatorWithDocuments> {
    const documents = {
      certificate_of_incorporation: this.validateDocumentUrl(operator.certificate_of_incorporation_url, 'pdf'),
      business_permit: this.validateDocumentUrl(operator.business_permit_url, 'image'),
      kato_membership: this.validateDocumentUrl(operator.kato_membership_url, 'url')
    };

    // Create signed URLs for valid documents
    const processedDocuments: any = {};
    
    if (operator.certificate_of_incorporation_url && documents.certificate_of_incorporation.valid) {
      const signedUrl = await this.getSignedUrl(operator.certificate_of_incorporation_url);
      processedDocuments.certificate_of_incorporation = {
        url: signedUrl,
        ...documents.certificate_of_incorporation
      };
    }

    if (operator.business_permit_url && documents.business_permit.valid) {
      const signedUrl = await this.getSignedUrl(operator.business_permit_url);
      processedDocuments.business_permit = {
        url: signedUrl,
        ...documents.business_permit
      };
    }

    if (operator.kato_membership_url && documents.kato_membership.valid) {
      const signedUrl = documents.kato_membership.type === 'external_url' 
        ? operator.kato_membership_url 
        : await this.getSignedUrl(operator.kato_membership_url);
      processedDocuments.kato_membership = {
        url: signedUrl,
        ...documents.kato_membership
      };
    }

    return {
      ...operator,
      documents: processedDocuments
    };
  }

  async getOperators(): Promise<ApiResponse<OperatorWithDocuments[]>> {
    try {
      console.log('Fetching operators from database...');
      
      const { data, error } = await supabase
        .from('operators')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching operators:', error);
        return {
          success: false,
          data: [],
          errors: [error.message]
        };
      }

      console.log('Raw operators data:', data);

      // Process each operator to include document validation and signed URLs
      const processedOperators = await Promise.all(
        data.map(async (operator: Operator) => {
          const processed = await this.processOperatorDocuments(operator);
          console.log(`Processed documents for ${operator.email}:`, processed.documents);
          return processed;
        })
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

      const processedOperator = await this.processOperatorDocuments(data);

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
