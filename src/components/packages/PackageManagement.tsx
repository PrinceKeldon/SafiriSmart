
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
  const { data: packages = [], isLoading } = useOperatorPackages();

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
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading packages...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Package Management</h1>
          <p className="text-gray-600">Define your tour packages and pricing</p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Create Package
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
  );
};
