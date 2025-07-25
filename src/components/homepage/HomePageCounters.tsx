
import { useHomePageCounters } from '@/hooks/useHomePageCounters';
import { Compass, Shield, Users, TrendingUp } from 'lucide-react';

export const HomePageCounters = () => {
  const { data: counters, isLoading } = useHomePageCounters();

  if (isLoading) {
    return (
      <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm text-gray-600 mb-6 sm:mb-8">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm text-gray-600 mb-6 sm:mb-8">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
        <span>
          <span className="font-bold text-green-600">
            {counters?.safariGuideVisits?.toLocaleString() || '0'}
          </span>
          {' '}SafariGuide AI Users
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Users className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 flex-shrink-0" />
        <span>
          <span className="font-bold text-orange-600">
            {counters?.tourMasterOperators?.toLocaleString() || '0'}
          </span>
          {' '}TourMaster AI Operators
        </span>
      </div>
    </div>
  );
};
