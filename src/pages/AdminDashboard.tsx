
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { adminService } from '@/services/AdminService';
import { Shield, Users, Settings, BarChart3, Eye, Edit } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { CreateOperatorDialog } from '@/components/admin/CreateOperatorDialog';
import { toast } from 'sonner';

type Operator = Tables<'operators'>;

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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

  const toggleOperatorStatus = async (operatorId: string, currentStatus: boolean) => {
    try {
      const result = await adminService.toggleOperatorStatus(operatorId, !currentStatus);
      
      if (result.success) {
        // Update the local state
        setOperators(prev => 
          prev.map(op => 
            op.id === operatorId 
              ? { ...op, is_active: !currentStatus }
              : op
          )
        );
        toast.success(`Operator ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      } else {
        setError(result.errors?.join(', ') || 'Failed to update operator status');
        toast.error('Failed to update operator status');
      }
    } catch (err) {
      setError('An unexpected error occurred while updating operator status');
      console.error('Error updating operator status:', err);
      toast.error('An unexpected error occurred');
    }
  };

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

  const activeOperators = operators.filter(op => op.is_active);
  const totalLeads = 48; // This would come from a separate API call in a real implementation

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">SafiriSmart Administration</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
              <Button onClick={logout} variant="outline">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Operators</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{operators.length}</div>
                <p className="text-xs text-muted-foreground">
                  {activeOperators.length} active operators
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalLeads}</div>
                <p className="text-xs text-muted-foreground">Generated this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Healthy</div>
                <p className="text-xs text-muted-foreground">All systems operational</p>
              </CardContent>
            </Card>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
              <Button 
                onClick={() => setError(null)} 
                variant="outline" 
                size="sm" 
                className="mt-2"
              >
                Dismiss
              </Button>
            </div>
          )}

          {/* Operators Management */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Operator Management</CardTitle>
                  <CardDescription>
                    Manage tour operators, approve registrations, and view operator details
                  </CardDescription>
                </div>
                <CreateOperatorDialog
                  open={isCreateDialogOpen}
                  onOpenChange={setIsCreateDialogOpen}
                  onCreateOperator={handleCreateOperator}
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-sm text-gray-500">Loading operators...</div>
                </div>
              ) : operators.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No operators found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {operators.map((operator) => (
                    <div key={operator.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="font-medium">{operator.name}</h3>
                            <p className="text-sm text-gray-500">{operator.email}</p>
                            <p className="text-sm text-gray-500">{operator.company}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={operator.role === 'admin' ? 'default' : 'secondary'}>
                          {operator.role}
                        </Badge>
                        <Badge variant={operator.is_active ? 'default' : 'destructive'}>
                          {operator.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant={operator.is_active ? "destructive" : "default"}
                            onClick={() => toggleOperatorStatus(operator.id, operator.is_active || false)}
                          >
                            {operator.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                Configure system settings, API keys, and platform preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                System Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
