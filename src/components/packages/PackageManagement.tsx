
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PackageList } from './PackageList';
import { PackageForm } from './PackageForm';
import { useOperatorPackages } from '@/hooks/useOperatorPackages';
import { OperatorPackage } from '@/types/operator';

export const PackageManagement = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<OperatorPackage | null>(null);
  const { data: packages = [], isLoading, error } = useOperatorPackages();

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
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Error loading packages. Please try again.</div>
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

        <PackageList 
          packages={packages} 
          onEdit={handleEdit}
        />

        <PackageForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          package={editingPackage}
        />
      </div>
    </div>
  );
};
