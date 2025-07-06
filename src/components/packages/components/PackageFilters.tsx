
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PackageFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  budgetFilter: string;
  onBudgetFilterChange: (budget: string) => void;
  durationFilter: string;
  onDurationFilterChange: (duration: string) => void;
  locationFilter: string;
  onLocationFilterChange: (location: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const PackageFilters: React.FC<PackageFiltersProps> = ({
  searchTerm,
  onSearchChange,
  budgetFilter,
  onBudgetFilterChange,
  durationFilter,
  onDurationFilterChange,
  locationFilter,
  onLocationFilterChange,
  onClearFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <h3 className="font-medium text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search packages..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={budgetFilter} onValueChange={onBudgetFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Budget Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Budget Tiers</SelectItem>
            <SelectItem value="budget">Budget</SelectItem>
            <SelectItem value="mid-range">Mid-range</SelectItem>
            <SelectItem value="luxury">Luxury</SelectItem>
          </SelectContent>
        </Select>

        <Select value={durationFilter} onValueChange={onDurationFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Durations</SelectItem>
            <SelectItem value="1-3">1-3 days</SelectItem>
            <SelectItem value="4-7">4-7 days</SelectItem>
            <SelectItem value="8-14">8-14 days</SelectItem>
            <SelectItem value="15+">15+ days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={locationFilter} onValueChange={onLocationFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="Nairobi">Nairobi</SelectItem>
            <SelectItem value="Masai Mara">Masai Mara</SelectItem>
            <SelectItem value="Amboseli">Amboseli</SelectItem>
            <SelectItem value="Tsavo">Tsavo</SelectItem>
            <SelectItem value="Samburu">Samburu</SelectItem>
            <SelectItem value="Lake Nakuru">Lake Nakuru</SelectItem>
            <SelectItem value="Mombasa">Mombasa</SelectItem>
            <SelectItem value="Diani Beach">Diani Beach</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {searchTerm}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-red-500" 
                onClick={() => onSearchChange('')}
              />
            </Badge>
          )}
          {budgetFilter !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Budget: {budgetFilter}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-red-500" 
                onClick={() => onBudgetFilterChange('all')}
              />
            </Badge>
          )}
          {durationFilter !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Duration: {durationFilter} days
              <X 
                className="w-3 h-3 cursor-pointer hover:text-red-500" 
                onClick={() => onDurationFilterChange('all')}
              />
            </Badge>
          )}
          {locationFilter !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Location: {locationFilter}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-red-500" 
                onClick={() => onLocationFilterChange('all')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
