import React from 'react';
import { MapPin, Users, Clock, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { OperatorPackage } from '@/types/operator';
import { getBudgetTierColor } from '../utils/packageHelpers';

interface PackagePreviewContentProps {
  pkg: OperatorPackage;
  operatorProfile?: any;
}

export const PackagePreviewContent: React.FC<PackagePreviewContentProps> = ({
  pkg,
  operatorProfile,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <Badge className={getBudgetTierColor(pkg.budget_tier || 'budget')}>
          {pkg.budget_tier || 'budget'}
        </Badge>
      </div>

      {pkg.description && (
        <div>
          <h3 className="font-semibold text-lg mb-2">Description</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {pkg.description}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <Clock className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-600">Duration</p>
            <p className="font-medium">{pkg.min_duration}-{pkg.max_duration} days</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <Users className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-600">Group Size</p>
            <p className="font-medium">{pkg.min_group_size}-{pkg.max_group_size} people</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <DollarSign className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-600">Cost per Day</p>
            <p className="font-medium">${pkg.estimated_cost_per_person_per_day}/person</p>
          </div>
        </div>
      </div>

      {pkg.included_locations && pkg.included_locations.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <MapPin className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-lg">Included Locations</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {pkg.included_locations.map((location, index) => (
              <Badge key={index} variant="outline" className="text-sm">
                {location}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {pkg.included_activities && pkg.included_activities.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-3">Included Activities</h3>
          <div className="flex flex-wrap gap-2">
            {pkg.included_activities.map((activity, index) => (
              <Badge key={index} variant="outline" className="text-sm">
                {activity}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t">
        <p className="text-sm text-gray-500">
          Created: {new Date(pkg.created_at).toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-500">
          Last updated: {new Date(pkg.updated_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};