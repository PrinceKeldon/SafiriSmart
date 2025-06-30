
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Edit, Trash2, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/ApiService';
import { useNavigate } from 'react-router-dom';

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

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newOperator, setNewOperator] = useState({
    name: '',
    email: '',
    company: '',
    specializations: [] as string[]
  });
  const [error, setError] = useState<string | null>(null);

  // Redirect if not admin
  React.useEffect(() => {
    if (user && !isAdmin()) {
      navigate('/dashboard');
    }
  }, [user, isAdmin, navigate]);

  // Fetch operators
  const { data: operators, isLoading, error: fetchError } = useQuery({
    queryKey: ['admin-operators'],
    queryFn: async () => {
      const response = await apiService.getOperators();
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    enabled: !!user && isAdmin()
  });

  // Create operator mutation
  const createOperatorMutation = useMutation({
    mutationFn: async (operatorData: typeof newOperator) => {
      const response = await apiService.createOperator(operatorData);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-operators'] });
      setIsCreateDialogOpen(false);
      setNewOperator({ name: '', email: '', company: '', specializations: [] });
      setError(null);
      
      // Show temporary password if available
      if ('temporary_password' in data) {
        alert(`Operator created successfully!\nTemporary password: ${data.temporary_password}\nPlease share this with the operator securely.`);
      }
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  const handleCreateOperator = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!newOperator.name || !newOperator.email || !newOperator.company) {
      setError('Please fill in all required fields');
      return;
    }

    createOperatorMutation.mutate(newOperator);
  };

  if (!user || !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
              <p className="text-gray-600">You need admin privileges to access this page.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage tour operators and system settings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Operators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operators?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Operators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {operators?.filter(op => op.is_active).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {operators?.filter(op => op.role === 'admin').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operators Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Tour Operators</CardTitle>
              <CardDescription>Manage tour operator accounts</CardDescription>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Operator
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Operator</DialogTitle>
                  <DialogDescription>
                    Add a new tour operator to the system
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleCreateOperator} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={newOperator.name}
                      onChange={(e) => setNewOperator(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter operator's full name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newOperator.email}
                      onChange={(e) => setNewOperator(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name *</Label>
                    <Input
                      id="company"
                      value={newOperator.company}
                      onChange={(e) => setNewOperator(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Enter company name"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                      disabled={createOperatorMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createOperatorMutation.isPending}
                    >
                      {createOperatorMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Operator'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {fetchError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                Failed to load operators: {fetchError instanceof Error ? fetchError.message : 'Unknown error'}
              </AlertDescription>
            </Alert>
          )}
          
          {operators && operators.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No operators found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Email</th>
                    <th className="text-left py-2">Company</th>
                    <th className="text-left py-2">Role</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {operators?.map((operator) => (
                    <tr key={operator.id} className="border-b">
                      <td className="py-3">{operator.name}</td>
                      <td className="py-3">{operator.email}</td>
                      <td className="py-3">{operator.company}</td>
                      <td className="py-3">
                        <Badge variant={operator.role === 'admin' ? 'default' : 'secondary'}>
                          {operator.role}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Badge variant={operator.is_active ? 'default' : 'destructive'}>
                          {operator.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
