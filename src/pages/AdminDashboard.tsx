
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { adminService } from '@/services/AdminService';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminStatsCards } from '@/components/admin/AdminStatsCards';
import { OperatorsManagementCard } from '@/components/admin/OperatorsManagementCard';
import { SystemConfigurationCard } from '@/components/admin/SystemConfigurationCard';
import { ErrorDisplay } from '@/components/admin/ErrorDisplay';

type Operator = Tables<'operators'>;

interface OperatorWithDocuments extends Operator {
  documents?: {
    certificate_of_incorporation?: { url: string; valid: boolean; type: string };
    business_permit?: { url: string; valid: boolean; type: string };
    kato_membership?: { url: string; valid: boolean; type: string };
  };
}

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [operators, setOperators] = useState<OperatorWithDocuments[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch operators data with enhanced document processing
  const fetchOperators = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting to fetch operators...');
      const result = await adminService.getOperators();
      
      if (result.success) {
        console.log('Successfully fetched operators:', result.data.length);
        
        // Log document status for each operator
        result.data.forEach(operator => {
          console.log(`Operator ${operator.email} documents:`, {
            certificate_of_incorporation: operator.certificate_of_incorporation_url,
            business_permit: operator.business_permit_url,
            kato_membership: operator.kato_membership_url,
            processed_documents: operator.documents
          });
        });
        
        setOperators(result.data);
      } else {
        const errorMessage = result.errors?.join(', ') || 'Failed to fetch operators';
        console.error('Failed to fetch operators:', errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while fetching operators';
      console.error('Unexpected error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  const handleCreateOperator = async (operatorData: any) => {
    try {
      const result = await adminService.createOperator(operatorData);
      
      if (result.success) {
        // Refresh the operators list to get the new operator with proper document processing
        await fetchOperators();
        toast.success('Operator created successfully!');
        
        // Show temporary password if provided
        if (result.data.temporary_password) {
          toast.info(`Temporary password: ${result.data.temporary_password}`, {
            duration: 10000,
          });
        }
      } else {
        const errorMessage = result.errors?.join(', ') || 'Failed to create operator';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('Error creating operator:', err);
      throw err;
    }
  };

  const handleUpdateOperator = (updatedOperator: Operator) => {
    // Refresh the operators list to get the updated operator with proper document processing
    fetchOperators();
  };

  const handleDeleteOperator = (operatorId: string) => {
    setOperators(prev => prev.filter(op => op.id !== operatorId));
  };

  const activeOperators = operators.filter(op => op.is_active);
  const totalLeads = 48; // This would come from a separate API call in a real implementation

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader userName={user?.name} onLogout={logout} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <AdminStatsCards 
            totalOperators={operators.length}
            activeOperators={activeOperators.length}
            totalLeads={totalLeads}
          />

          {/* Error Display */}
          {error && (
            <ErrorDisplay 
              error={error} 
              onDismiss={() => setError(null)} 
            />
          )}

          <OperatorsManagementCard
            operators={operators}
            loading={loading}
            onCreateOperator={handleCreateOperator}
            onUpdateOperator={handleUpdateOperator}
            onDeleteOperator={handleDeleteOperator}
          />

          <SystemConfigurationCard />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
