
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Package, Settings } from 'lucide-react';
import { ConfigLink } from '@/components/ui/navigation/ConfigLink';
import { OperatorsList } from '@/components/admin/OperatorsList';
import { CreateOperatorDialog } from '@/components/admin/CreateOperatorDialog';
import { adminService } from '@/services/AdminService';
import { toast } from 'sonner';

interface Operator {
  id: string;
  name: string;
  email: string;
  company: string;
  company_name: string;
  registration_number: string;
  address: string;
  city: string;
  country: string;
  contact_person_name: string;
  contact_person_phone: string;
  website_url: string;
  description: string;
  certificate_of_incorporation_url: string;
  business_permit_url: string;
  kato_membership_url: string;
  role: string;
  specializations: string[];
  is_active: boolean;
  created_at: string;
}

const AdminDashboard = () => {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOperators = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getOperators();
      if (response.success) {
        setOperators(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch operators:', error);
      toast.error('Failed to load operators');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOperators();

    // Listen for operator profile updates
    const handleOperatorUpdate = () => {
      console.log('Operator profile updated - refreshing admin dashboard');
      fetchOperators();
    };

    window.addEventListener('operatorProfileUpdated', handleOperatorUpdate);
    
    return () => {
      window.removeEventListener('operatorProfileUpdated', handleOperatorUpdate);
    };
  }, []);

  const handleUpdateOperator = (updatedOperator: Operator) => {
    setOperators(operators.map(op => 
      op.id === updatedOperator.id ? updatedOperator : op
    ));
    toast.success('Operator updated successfully');
  };

  const handleCreateOperator = async (newOperatorData: {
    name: string;
    email: string;
    company: string;
    specializations: string[];
  }) => {
    try {
      const response = await adminService.createOperator(newOperatorData);
      if (response.success) {
        const operatorWithDefaults: Operator = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          company: response.data.company,
          specializations: response.data.specializations,
          role: response.data.role,
          is_active: response.data.is_active,
          created_at: response.data.created_at,
          company_name: response.data.company_name,
          registration_number: response.data.registration_number,
          address: response.data.address,
          city: response.data.city,
          country: response.data.country,
          contact_person_name: response.data.contact_person_name,
          contact_person_phone: response.data.contact_person_phone,
          website_url: response.data.website_url,
          description: response.data.description,
          certificate_of_incorporation_url: response.data.certificate_of_incorporation_url,
          business_permit_url: response.data.business_permit_url,
          kato_membership_url: response.data.kato_membership_url,
        };
        setOperators([...operators, operatorWithDefaults]);
        toast.success('Operator created successfully');
      }
    } catch (error) {
      console.error('Failed to create operator:', error);
      toast.error('Failed to create operator');
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Website Administration</h1>
            <p className="text-gray-600">Manage operators, system settings, and platform configuration</p>
          </div>
          <ConfigLink />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Operators</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{operators.length}</div>
              <p className="text-xs text-muted-foreground">Active tour operators</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">All platform leads</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Packages</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">43</div>
              <p className="text-xs text-muted-foreground">Published packages</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Online</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Operators Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Tour Operators</CardTitle>
                <CardDescription>Manage registered tour operators and their access</CardDescription>
              </div>
              
              <CreateOperatorDialog onCreateOperator={handleCreateOperator} />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading operators...</div>
            ) : (
              <OperatorsList 
                operators={operators} 
                onUpdateOperator={handleUpdateOperator}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
