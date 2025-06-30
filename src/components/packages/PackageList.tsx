
import React from 'react';
import { Edit, Trash2, MapPin, Users, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { OperatorPackage } from '@/types/operator';
import { useDeleteOperatorPackage } from '@/hooks/useOperatorPackages';
import { toast } from 'sonner';

interface PackageListProps {
  packages: OperatorPackage[];
  onEdit: (pkg: OperatorPackage) => void;
}

export const PackageList: React.FC<PackageListProps> = ({ packages, onEdit }) => {
  const deletePackage = useDeleteOperatorPackage();

  const handleDelete = async (id: string) => {
    try {
      await deletePackage.mutateAsync(id);
      toast.success('Package deleted successfully');
    } catch (error) {
      toast.error('Failed to delete package');
    }
  };

  const getBudgetTierColor = (tier: string) => {
    switch (tier) {
      case 'budget':
        return 'bg-green-100 text-green-800';
      case 'mid-range':
        return 'bg-blue-100 text-blue-800';
      case 'luxury':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!packages || packages.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-gray-500 text-center">
            <h3 className="text-lg font-medium mb-2">No packages created yet</h3>
            <p>Create your first tour package to start managing your pricing</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {packages.map((pkg) => (
        <Card key={pkg.id} className="relative">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{pkg.package_name || 'Untitled Package'}</CardTitle>
              <Badge className={getBudgetTierColor(pkg.budget_tier || 'budget')}>
                {pkg.budget_tier || 'budget'}
              </Badge>
            </div>
            {pkg.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{pkg.description}</p>
            )}
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{pkg.min_duration || 1}-{pkg.max_duration || 7} days</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span>{pkg.min_group_size || 1}-{pkg.max_group_size || 10} people</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span className="font-medium">
                ${pkg.estimated_cost_per_person_per_day || 100}/person/day
              </span>
            </div>

            {pkg.included_locations && pkg.included_locations.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium">Locations:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {pkg.included_locations.slice(0, 3).map((location, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {location}
                    </Badge>
                  ))}
                  {pkg.included_locations.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{pkg.included_locations.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(pkg)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Package</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{pkg.package_name || 'this package'}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(pkg.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
