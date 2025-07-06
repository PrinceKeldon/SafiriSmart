
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useOperatorPackages } from '@/hooks/useOperatorPackages';
import { PackageList } from './PackageList';
import { PackageForm } from './PackageForm';
import { PackageFilters } from './components/PackageFilters';
import { usePackageFilters } from './hooks/usePackageFilters';
import { OperatorPackage } from '@/types/operator';

export const PackageManagement: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<OperatorPackage | undefined>();

  const { data: packages = [], isLoading, error } = useOperatorPackages();

  const {
    searchTerm,
    setSearchTerm,
    budgetFilter,
    setBudgetFilter,
    durationFilter,
    setDurationFilter,
    locationFilter,
    setLocationFilter,
    filteredPackages,
    hasActiveFilters,
    clearFilters,
  } = usePackageFilters(packages);

  const handleCreatePackage = () => {
    setEditingPackage(undefined);
    setIsFormOpen(true);
  };

  const handleEditPackage = (pkg: OperatorPackage) => {
    setEditingPackage(pkg);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPackage(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading packages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-red-500 text-center">
            <h3 className="text-lg font-medium mb-2">Error loading packages</h3>
            <p>{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Package Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your tour packages and pricing
          </p>
        </div>
        <Button onClick={handleCreatePackage} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Package
        </Button>
      </div>

      <PackageFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        budgetFilter={budgetFilter}
        onBudgetFilterChange={setBudgetFilter}
        durationFilter={durationFilter}
        onDurationFilterChange={setDurationFilter}
        locationFilter={locationFilter}
        onLocationFilterChange={setLocationFilter}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {filteredPackages.length} of {packages.length} packages
          {hasActiveFilters && ' (filtered)'}
        </p>
      </div>

      <PackageList 
        packages={filteredPackages} 
        onEdit={handleEditPackage}
      />

      <PackageForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        package={editingPackage}
      />
    </div>
  );
};
