
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Package, Settings } from 'lucide-react';
import { ConfigLink } from '@/components/ui/navigation/ConfigLink';
import { OperatorsList } from '@/components/admin/OperatorsList';
import { CreateOperatorDialog } from '@/components/admin/CreateOperatorDialog';

const AdminDashboard = () => {
  const [operators, setOperators] = useState([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      company: 'Safari Adventures Ltd',
      company_name: 'Safari Adventures Limited',
      registration_number: 'REG-001-2024',
      address: '123 Safari Street, Wildlife District',
      city: 'Nairobi',
      country: 'Kenya',
      contact_person_name: 'John Doe',
      contact_person_phone: '+254-700-123456',
      website_url: 'https://safariadventures.com',
      description: 'Leading safari operator specializing in wildlife photography tours and cultural experiences.',
      certificate_of_incorporation_url: 'https://example.com/cert1.pdf',
      business_permit_url: 'https://example.com/permit1.pdf',
      kato_membership_url: '',
      role: 'operator',
      specializations: ['Safari Tours', 'Wildlife Photography'],
      is_active: true,
      created_at: '2024-01-15'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      company: 'Mountain Expeditions',
      company_name: 'Mountain Expeditions Kenya Ltd',
      registration_number: 'REG-002-2024',
      address: '456 Mountain View Road',
      city: 'Nakuru',
      country: 'Kenya',
      contact_person_name: 'Jane Smith',
      contact_person_phone: '+254-700-789012',
      website_url: 'https://mountainexpeditions.com',
      description: 'Expert mountain trekking and adventure tourism company with over 10 years of experience.',
      certificate_of_incorporation_url: 'https://example.com/cert2.pdf',
      business_permit_url: 'https://example.com/permit2.pdf',
      kato_membership_url: 'https://example.com/kato2.pdf',
      role: 'operator',
      specializations: ['Mountain Climbing', 'Trekking'],
      is_active: true,
      created_at: '2024-01-20'
    }
  ]);

  const handleUpdateOperator = (updatedOperator) => {
    setOperators(operators.map(op => 
      op.id === updatedOperator.id ? updatedOperator : op
    ));
  };

  const handleCreateOperator = (newOperator) => {
    const operatorWithDefaults = {
      ...newOperator,
      id: (operators.length + 1).toString(),
      role: 'operator',
      is_active: true,
      created_at: new Date().toISOString().split('T')[0],
      company_name: '',
      registration_number: '',
      address: '',
      city: '',
      country: 'Kenya',
      contact_person_name: '',
      contact_person_phone: '',
      website_url: '',
      description: '',
      certificate_of_incorporation_url: '',
      business_permit_url: '',
      kato_membership_url: '',
    };
    setOperators([...operators, operatorWithDefaults]);
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
            <OperatorsList 
              operators={operators} 
              onUpdateOperator={handleUpdateOperator}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
