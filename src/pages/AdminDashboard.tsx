
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { adminService } from '@/services/AdminService';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminStatsCards } from '@/components/admin/AdminStatsCards';
import { OperatorsManagementCard } from '@/components/admin/OperatorsManagementCard';
import { OperatorVerificationReview } from '@/components/admin/OperatorVerificationReview';
import { SystemConfigurationCard } from '@/components/admin/SystemConfigurationCard';
import { ErrorDisplay } from '@/components/admin/ErrorDisplay';

type Operator = Tables<'operators'>;

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch operators data
  useEffect(() => {
    const fetchOperators = async () => {
      try {
        setLoading(true);
        const result = await adminService.getOperators();
        
        if (result.success) {
          setOperators(result.data);
        } else {
          setError(result.errors?.join(', ') || 'Failed to fetch operators');
        }
      } catch (err) {
        setError('An unexpected error occurred while fetching operators');
        console.error('Error fetching operators:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOperators();
  }, []);

  const handleCreateOperator = async (operatorData: any) => {
    try {
      const result = await adminService.createOperator(operatorData);
      
      if (result.success) {
        // Add the new operator to the local state
        setOperators(prev => [result.data, ...prev]);
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
      throw err; // Re-throw to let the dialog handle the error
    }
  };

  const handleUpdateOperator = (updatedOperator: Operator) => {
    setOperators(prev => 
      prev.map(op => 
        op.id === updatedOperator.id ? updatedOperator : op
      )
    );
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

          {/* Operator Verification Review */}
          <div className="mb-8">
            <OperatorVerificationReview
              operators={operators}
              onOperatorUpdate={handleUpdateOperator}
            />
          </div>

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
