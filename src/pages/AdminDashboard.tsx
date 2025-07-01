
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, UserCheck, UserX } from 'lucide-react';
import { CreateOperatorDialog } from '@/components/admin/CreateOperatorDialog';
import { OperatorsList } from '@/components/admin/OperatorsList';
import { OperatorDetailView } from '@/components/admin/OperatorDetailView';
import { adminService } from '@/services/AdminService';
import { Operator } from '@/types/operator';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);

  const { data: operators = [], isLoading, error, refetch } = useQuery({
    queryKey: ['operators'],
    queryFn: adminService.getOperators,
  });

  const handleCreateOperator = async (operatorData: any) => {
    try {
      await adminService.createOperator(operatorData);
      toast.success('Operator created successfully');
      refetch();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating operator:', error);
      toast.error('Failed to create operator');
    }
  };

  const handleDeleteOperator = async (operatorId: string) => {
    try {
      await adminService.deleteOperator(operatorId);
      toast.success('Operator deleted successfully');
      refetch();
      if (selectedOperator?.id === operatorId) {
        setSelectedOperator(null);
      }
    } catch (error) {
      console.error('Error deleting operator:', error);
      toast.error('Failed to delete operator');
    }
  };

  const handleUpdateOperator = async (operatorId: string, updates: Partial<Operator>) => {
    try {
      await adminService.updateOperator(operatorId, updates);
      toast.success('Operator updated successfully');
      refetch();
    } catch (error) {
      console.error('Error updating operator:', error);
      toast.error('Failed to update operator');
    }
  };

  const stats = {
    total: operators.length,
    active: operators.filter(op => op.is_active).length,
    inactive: operators.filter(op => !op.is_active).length,
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading operators...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-600">Error loading operators</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage tour operators and system settings</p>
          </div>
          
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            size="lg"
            className="flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Operator</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Operators</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Operators</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Operators</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Operators List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Tour Operators</CardTitle>
              </CardHeader>
              <CardContent>
                <OperatorsList
                  operators={operators}
                  onSelectOperator={setSelectedOperator}
                  onDeleteOperator={handleDeleteOperator}
                  selectedOperatorId={selectedOperator?.id}
                />
              </CardContent>
            </Card>
          </div>

          {/* Operator Details */}
          <div>
            <OperatorDetailView
              operator={selectedOperator}
              onUpdateOperator={handleUpdateOperator}
            />
          </div>
        </div>

        {/* Create Operator Dialog */}
        <CreateOperatorDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onCreateOperator={handleCreateOperator}
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
