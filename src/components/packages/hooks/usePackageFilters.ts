
import { useState, useMemo } from 'react';
import { OperatorPackage } from '@/types/operator';

export interface PackageFilters {
  search: string;
  budgetTier: string;
  minDuration: number | null;
  maxDuration: number | null;
  includedLocations: string[];
  includedActivities: string[];
}

const initialFilters: PackageFilters = {
  search: '',
  budgetTier: '',
  minDuration: null,
  maxDuration: null,
  includedLocations: [],
  includedActivities: [],
};

export const usePackageFilters = (packages: OperatorPackage[]) => {
  const [filters, setFilters] = useState<PackageFilters>(initialFilters);

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesName = pkg.package_name?.toLowerCase().includes(searchTerm);
        const matchesDescription = pkg.description?.toLowerCase().includes(searchTerm);
        if (!matchesName && !matchesDescription) return false;
      }

      // Budget tier filter
      if (filters.budgetTier && pkg.budget_tier !== filters.budgetTier) {
        return false;
      }

      // Duration filters
      if (filters.minDuration !== null && pkg.min_duration < filters.minDuration) {
        return false;
      }
      if (filters.maxDuration !== null && pkg.max_duration > filters.maxDuration) {
        return false;
      }

      // Location filter
      if (filters.includedLocations.length > 0) {
        const hasMatchingLocation = filters.includedLocations.some(location =>
          pkg.included_locations?.includes(location)
        );
        if (!hasMatchingLocation) return false;
      }

      // Activity filter
      if (filters.includedActivities.length > 0) {
        const hasMatchingActivity = filters.includedActivities.some(activity =>
          pkg.included_activities?.includes(activity)
        );
        if (!hasMatchingActivity) return false;
      }

      return true;
    });
  }, [packages, filters]);

  const updateFilter = (key: keyof PackageFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value !== '';
    return value !== null;
  });

  return {
    filters,
    filteredPackages,
    updateFilter,
    clearFilters,
    hasActiveFilters,
  };
};
