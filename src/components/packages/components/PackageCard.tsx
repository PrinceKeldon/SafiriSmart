import React from 'react';
import { Edit, Trash2, MapPin, Users, Clock, DollarSign, Download, Share2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OperatorPackage } from '@/types/operator';
import { getBudgetTierColor } from '../utils/packageHelpers';
import { PackageDeleteDialog } from './PackageDeleteDialog';

interface PackageCardProps {
  pkg: OperatorPackage;
  operatorProfile?: any;
  onEdit: (pkg: OperatorPackage) => void;
  onDelete: (id: string) => void;
  onPreview: (pkg: OperatorPackage) => void;
  onDownload: (pkg: OperatorPackage) => void;
  onShare: (pkg: OperatorPackage) => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  pkg,
  operatorProfile,
  onEdit,
  onDelete,
  onPreview,
  onDownload,
  onShare,
}) => {
  return (
    <Card className="relative hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            {(operatorProfile?.company_name || operatorProfile?.company) && (
              <p className="text-xs text-gray-500 mb-1">
                {operatorProfile.company_name || operatorProfile.company}
              </p>
            )}
            <CardTitle className="text-lg">{pkg.package_name || 'Untitled Package'}</CardTitle>
          </div>
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

        <div className="flex justify-between pt-4 gap-2">
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPreview(pkg)}
              title="Preview package"
            >
              <Eye className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(pkg)}
              title="Download package"
            >
              <Download className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShare(pkg)}
              title="Share package"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(pkg)}
              title="Edit package"
            >
              <Edit className="w-4 h-4" />
            </Button>
            
            <PackageDeleteDialog
              packageName={pkg.package_name || 'this package'}
              onDelete={() => onDelete(pkg.id)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};