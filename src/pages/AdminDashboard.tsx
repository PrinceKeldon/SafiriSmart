
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Users, Package, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { ConfigLink } from '@/components/ui/navigation/ConfigLink';

const AdminDashboard = () => {
  const [operators, setOperators] = useState([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      company: 'Safari Adventures Ltd',
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
      role: 'operator',
      specializations: ['Mountain Climbing', 'Trekking'],
      is_active: true,
      created_at: '2024-01-20'
    }
  ]);

  const [isAddingOperator, setIsAddingOperator] = useState(false);
  const [newOperator, setNewOperator] = useState({
    name: '',
    email: '',
    company: '',
    specializations: ''
  });

  const handleAddOperator = async () => {
    setIsAddingOperator(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const operator = {
        id: (operators.length + 1).toString(),
        ...newOperator,
        role: 'operator',
        specializations: newOperator.specializations.split(',').map(s => s.trim()),
        is_active: true,
        created_at: new Date().toISOString().split('T')[0]
      };
      
      setOperators([...operators, operator]);
      setNewOperator({ name: '', email: '', company: '', specializations: '' });
      toast.success('Operator created successfully');
      
    } catch (error) {
      toast.error('Failed to create operator');
    } finally {
      setIsAddingOperator(false);
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
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Operator
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Operator</DialogTitle>
                    <DialogDescription>Create a new tour operator account</DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={newOperator.name}
                        onChange={(e) => setNewOperator({ ...newOperator, name: e.target.value })}
                        placeholder="Enter operator's full name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newOperator.email}
                        onChange={(e) => setNewOperator({ ...newOperator, email: e.target.value })}
                        placeholder="Enter email address"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="company">Company Name</Label>
                      <Input
                        id="company"
                        value={newOperator.company}
                        onChange={(e) => setNewOperator({ ...newOperator, company: e.target.value })}
                        placeholder="Enter company name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="specializations">Specializations</Label>
                      <Textarea
                        id="specializations"
                        value={newOperator.specializations}
                        onChange={(e) => setNewOperator({ ...newOperator, specializations: e.target.value })}
                        placeholder="e.g., Safari Tours, Mountain Climbing (comma-separated)"
                        rows={3}
                      />
                    </div>
                    
                    <Button 
                      onClick={handleAddOperator} 
                      disabled={isAddingOperator}
                      className="w-full"
                    >
                      {isAddingOperator ? 'Creating...' : 'Create Operator'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {operators.map((operator) => (
                <div key={operator.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{operator.name}</h3>
                      <Badge variant={operator.is_active ? "default" : "secondary"}>
                        {operator.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{operator.email}</p>
                    <p className="text-sm text-gray-500">{operator.company}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {operator.specializations.map((spec, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Joined: {operator.created_at}</p>
                    <div className="flex space-x-2 mt-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">
                        {operator.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
