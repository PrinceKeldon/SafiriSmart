
import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PackageFilters, usePackageFilters } from '../hooks/usePackageFilters';
import { POPULAR_LOCATIONS, POPULAR_ACTIVITIES } from '../constants/PackageFormConstants';

interface PackageFiltersProps {
  filters: PackageFilters;
  onUpdateFilter: (key: keyof PackageFilters, value: any) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const PackageFiltersComponent: React.FC<PackageFiltersProps> = ({
  filters,
  onUpdateFilter,
  onClearFilters,
  hasActiveFilters,
}) => {
  const handleLocationChange = (location: string, checked: boolean) => {
    const updatedLocations = checked
      ? [...filters.includedLocations, location]
      : filters.includedLocations.filter(loc => loc !== location);
    onUpdateFilter('includedLocations', updatedLocations);
  };

  const handleActivityChange = (activity: string, checked: boolean) => {
    const updatedActivities = checked
      ? [...filters.includedActivities, activity]
      : filters.includedActivities.filter(act => act !== activity);
    onUpdateFilter('includedActivities', updatedActivities);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filter Packages</span>
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Clear Filters</span>
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search */}
        <div>
          <Label htmlFor="search">Search Packages</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="search"
              placeholder="Search by name or description..."
              value={filters.search}
              onChange={(e) => onUpdateFilter('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Budget Tier */}
        <div>
          <Label>Budget Tier</Label>
          <Select
            value={filters.budgetTier}
            onValueChange={(value) => onUpdateFilter('budgetTier', value === 'all' ? '' : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All budget tiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Budget Tiers</SelectItem>
              <SelectItem value="budget">Budget</SelectItem>
              <SelectItem value="mid-range">Mid-range</SelectItem>
              <SelectItem value="luxury">Luxury</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Duration Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="minDuration">Min Duration (days)</Label>
            <Input
              id="minDuration"
              type="number"
              min="1"
              placeholder="Min days"
              value={filters.minDuration || ''}
              onChange={(e) => onUpdateFilter('minDuration', e.target.value ? parseInt(e.target.value) : null)}
            />
          </div>
          <div>
            <Label htmlFor="maxDuration">Max Duration (days)</Label>
            <Input
              id="maxDuration"
              type="number"
              min="1"
              placeholder="Max days"
              value={filters.maxDuration || ''}
              onChange={(e) => onUpdateFilter('maxDuration', e.target.value ? parseInt(e.target.value) : null)}
            />
          </div>
        </div>

        {/* Included Locations */}
        <div>
          <Label>Included Locations</Label>
          <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
            {POPULAR_LOCATIONS.map((location) => (
              <div key={location} className="flex items-center space-x-2">
                <Checkbox
                  id={`location-${location}`}
                  checked={filters.includedLocations.includes(location)}
                  onCheckedChange={(checked) => handleLocationChange(location, !!checked)}
                />
                <Label
                  htmlFor={`location-${location}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {location}
                </Label>
              </div>
            ))}
          </div>
          {filters.includedLocations.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {filters.includedLocations.map((location) => (
                <Badge key={location} variant="secondary" className="text-xs">
                  {location}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => handleLocationChange(location, false)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Included Activities */}
        <div>
          <Label>Included Activities</Label>
          <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
            {POPULAR_ACTIVITIES.map((activity) => (
              <div key={activity} className="flex items-center space-x-2">
                <Checkbox
                  id={`activity-${activity}`}
                  checked={filters.includedActivities.includes(activity)}
                  onCheckedChange={(checked) => handleActivityChange(activity, !!checked)}
                />
                <Label
                  htmlFor={`activity-${activity}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {activity}
                </Label>
              </div>
            ))}
          </div>
          {filters.includedActivities.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {filters.includedActivities.map((activity) => (
                <Badge key={activity} variant="secondary" className="text-xs">
                  {activity}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => handleActivityChange(activity, false)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
