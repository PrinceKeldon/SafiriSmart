
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PackageList } from './PackageList';
import { PackageForm } from './PackageForm';
import { PackageFiltersComponent } from './components/PackageFilters';
import { useOperatorPackages } from '@/hooks/useOperatorPackages';
import { usePackageFilters } from './hooks/usePackageFilters';
import { OperatorPackage } from '@/types/operator';
import { toast } from 'sonner';

export const PackageManagement = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<OperatorPackage | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const { data: packages = [], isLoading, error, refetch } = useOperatorPackages();

  const {
    filters,
    filteredPackages,
    updateFilter,
    clearFilters,
    hasActiveFilters,
  } = usePackageFilters(packages);

  console.log('Packages data:', packages);
  console.log('Filtered packages:', filteredPackages);
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
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Package Management</h1>
            <p className="text-gray-600">Define your tour packages and pricing structures</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Button onClick={handleCreateNew} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create Package</span>
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        {packages.length > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredPackages.length} of {packages.length} packages
              {hasActiveFilters && ' (filtered)'}
            </span>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          {showFilters && packages.length > 0 && (
            <div className="lg:col-span-1">
              <PackageFiltersComponent
                filters={filters}
                onUpdateFilter={updateFilter}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
          )}

          {/* Main Content */}
          <div className={showFilters && packages.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'}>
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
            ) : filteredPackages.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <h3 className="text-xl font-semibold mb-2">No packages match your filters</h3>
                  <p className="text-gray-500 text-center mb-4">
                    Try adjusting your search criteria or clear all filters
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <PackageList 
                packages={filteredPackages} 
                onEdit={handleEdit}
              />
            )}
          </div>
        </div>

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
