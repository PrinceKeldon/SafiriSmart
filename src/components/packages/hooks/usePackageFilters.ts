
import { useState, useMemo } from 'react';
import { OperatorPackage } from '@/types/operator';

export const usePackageFilters = (packages: OperatorPackage[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          pkg.package_name?.toLowerCase().includes(searchLower) ||
          pkg.description?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Budget filter
      if (budgetFilter !== 'all' && pkg.budget_tier !== budgetFilter) {
        return false;
      }

      // Duration filter
      if (durationFilter !== 'all') {
        const minDuration = pkg.min_duration || 1;
        const maxDuration = pkg.max_duration || 1;
        
        switch (durationFilter) {
          case '1-3':
            if (maxDuration > 3) return false;
            break;
          case '4-7':
            if (minDuration > 7 || maxDuration < 4) return false;
            break;
          case '8-14':
            if (minDuration > 14 || maxDuration < 8) return false;
            break;
          case '15+':
            if (maxDuration < 15) return false;
            break;
        }
      }

      // Location filter
      if (locationFilter !== 'all') {
        const locations = pkg.included_locations || [];
        if (!locations.some(location => 
          location.toLowerCase().includes(locationFilter.toLowerCase())
        )) {
          return false;
        }
      }

      return true;
    });
  }, [packages, searchTerm, budgetFilter, durationFilter, locationFilter]);

  const hasActiveFilters = searchTerm || budgetFilter !== 'all' || durationFilter !== 'all' || locationFilter !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setBudgetFilter('all');
    setDurationFilter('all');
    setLocationFilter('all');
  };

  return {
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
  };
};
