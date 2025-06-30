
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/ApiService';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Edit, Trash2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

const createOperatorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().min(2, 'Company name must be at least 2 characters'),
  specializations: z.string().optional(),
});

type CreateOperatorFormData = z.infer<typeof createOperatorSchema>;

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
  const { isAdmin } = useAuth();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateOperatorFormData>({
    resolver: zodResolver(createOperatorSchema),
  });

  useEffect(() => {
    if (!isAdmin()) {
      return;
    }
    fetchOperators();
  }, [isAdmin]);

  const fetchOperators = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getOperators();
      if (response.success) {
        setOperators(response.data);
      } else {
        setError('Failed to fetch operators');
      }
    } catch (error) {
      console.error('Error fetching operators:', error);
      setError('Failed to fetch operators');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CreateOperatorFormData) => {
    setIsSubmitting(true);
    setError(null);
    setTempPassword(null);

    try {
      const specializations = data.specializations 
        ? data.specializations.split(',').map(s => s.trim()).filter(s => s.length > 0)
        : [];

      const response = await apiService.createOperator({
        name: data.name,
        email: data.email,
        company: data.company,
        specializations,
      });

      if (response.success) {
        toast.success('Operator created successfully');
        setTempPassword(response.data.temporary_password || null);
        reset();
        fetchOperators();
      } else {
        setError(response.message || 'Failed to create operator');
      }
    } catch (error) {
      console.error('Error creating operator:', error);
      setError(error instanceof Error ? error.message : 'Failed to create operator');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin()) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to access the admin dashboard.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600">Manage tour operator accounts</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add New Operator
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Operator</DialogTitle>
                <DialogDescription>
                  Add a new tour operator to the system.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {tempPassword && (
                  <Alert>
                    <AlertDescription>
                      <strong>Temporary Password:</strong> {tempPassword}
                      <br />
                      <small>Please share this password with the operator securely.</small>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter operator name"
                    {...register('name')}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    {...register('email')}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="Enter company name"
                    {...register('company')}
                    className={errors.company ? 'border-red-500' : ''}
                  />
                  {errors.company && (
                    <p className="text-sm text-red-600">{errors.company.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specializations">Specializations (comma-separated)</Label>
                  <Input
                    id="specializations"
                    placeholder="e.g., Wildlife Safari, Cultural Tours"
                    {...register('specializations')}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Operator'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      reset();
                      setError(null);
                      setTempPassword(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Tour Operators ({operators.length})
            </CardTitle>
            <CardDescription>
              Manage all tour operator accounts in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading operators...</div>
            ) : operators.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No operators found. Create your first operator account.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Specializations</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operators.map((operator) => (
                    <TableRow key={operator.id}>
                      <TableCell className="font-medium">{operator.name}</TableCell>
                      <TableCell>{operator.email}</TableCell>
                      <TableCell>{operator.company}</TableCell>
                      <TableCell>
                        <Badge variant={operator.role === 'admin' ? 'default' : 'secondary'}>
                          {operator.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={operator.is_active ? 'default' : 'destructive'}>
                          {operator.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {operator.specializations.map((spec, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
