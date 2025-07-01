
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PackageList } from './PackageList';
import { PackageForm } from './PackageForm';
import { useOperatorPackages } from '@/hooks/useOperatorPackages';
import { OperatorPackage } from '@/types/operator';
import { toast } from 'sonner';

export const PackageManagement = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<OperatorPackage | null>(null);
  const { data: packages = [], isLoading, error, refetch } = useOperatorPackages();

  console.log('Packages data:', packages);
  console.log('Loading state:', isLoading);
  console.log('Error:', error);

  const handleCreateNew = () => {
    setEditingPackage(null);
    setIsFormOpen(true);
  };

  const handleEdit = (pkg: OperatorPackage) => {
    setEditingPackage(pkg);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingPackage(null);
    // Refresh the packages list after form closes
    refetch();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading packages...</div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Package loading error:', error);
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-red-500 mb-4">Error loading packages: {error.message}</div>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Package Management</h1>
            <p className="text-gray-600">Define your tour packages and pricing structures</p>
          </div>
          <Button onClick={handleCreateNew} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Create Package</span>
          </Button>
        </div>

        {!packages || packages.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h3 className="text-xl font-semibold mb-2">No packages to display</h3>
              <p className="text-gray-500 text-center mb-4">
                Create your first tour package to start managing your offerings
              </p>
              <Button onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Package
              </Button>
            </CardContent>
          </Card>
        ) : (
          <PackageList 
            packages={packages} 
            onEdit={handleEdit}
          />
        )}

        {/* Package Form Dialog */}
        <PackageForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          package={editingPackage}
        />
      </div>
    </div>
  );
};
