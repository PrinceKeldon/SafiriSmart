
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, MapPin, Users, Calendar, DollarSign, Star } from 'lucide-react';
import { toast } from 'sonner';

interface PackageMatch {
  package: {
    id: string;
    package_name: string;
    description: string;
    min_duration: number;
    max_duration: number;
    min_group_size: number;
    max_group_size: number;
    budget_tier: string;
    estimated_cost_per_person_per_day: number;
    included_locations: string[];
    included_activities: string[];
  };
  operator: {
    id: string;
    name: string;
    company: string;
    services_offered: string[];
    destinations_covered: string[];
  };
  match_score: number;
}

interface OperatorSelectionStepProps {
  preferences: any;
  selectedPackages: string[];
  onPackageSelectionChange: (packageIds: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const OperatorSelectionStep: React.FC<OperatorSelectionStepProps> = ({
  preferences,
  selectedPackages,
  onPackageSelectionChange,
  onNext,
  onBack
}) => {
  const [matchingPackages, setMatchingPackages] = useState<PackageMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMatchingPackages();
  }, [preferences]);

  const fetchMatchingPackages = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      
      if (preferences.duration) queryParams.append('duration', preferences.duration.toString());
      if (preferences.budgetRange) queryParams.append('budget_range', preferences.budgetRange);
      if (preferences.interests && preferences.interests.length > 0) {
        queryParams.append('interests', preferences.interests.join(','));
      }
      if (preferences.groupSize) queryParams.append('group_size', preferences.groupSize.toString());
      if (preferences.travelPace) queryParams.append('travel_pace', preferences.travelPace);
      if (preferences.languages && preferences.languages.length > 0) {
        queryParams.append('languages', preferences.languages.join(','));
      }

      const response = await fetch(`http://localhost:8001/api/packages/match?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch matching packages');
      }

      const result = await response.json();
      
      if (result.success) {
        setMatchingPackages(result.data || []);
      } else {
        throw new Error('No matching packages found');
      }
    } catch (err) {
      console.error('Error fetching matching packages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load matching packages');
      toast.error('Failed to load matching packages');
    } finally {
      setLoading(false);
    }
  };

  const handlePackageToggle = (packageId: string) => {
    const updatedSelection = selectedPackages.includes(packageId)
      ? selectedPackages.filter(id => id !== packageId)
      : [...selectedPackages, packageId];
    
    onPackageSelectionChange(updatedSelection);
  };

  const getBudgetTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'budget': return 'bg-green-100 text-green-800';
      case 'mid-range': return 'bg-blue-100 text-blue-800';
      case 'luxury': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleContinue = () => {
    if (selectedPackages.length === 0) {
      toast.error('Please select at least one package or operator');
      return;
    }
    onNext();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Finding matching packages...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchMatchingPackages} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Safari Experts
        </h2>
        <p className="text-gray-600">
          We found {matchingPackages.length} packages that match your preferences. 
          Select the operators you'd like to receive quotes from.
        </p>
      </div>

      {matchingPackages.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            No packages match your exact preferences, but don't worry! 
            Our operators can create custom packages for you.
          </p>
          <Button onClick={onNext} className="bg-orange-600 hover:bg-orange-700">
            Continue with Custom Matching
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {matchingPackages.map((match) => (
              <Card key={match.package.id} className="relative">
                <div className="absolute top-4 right-4">
                  <Checkbox
                    checked={selectedPackages.includes(match.package.id)}
                    onCheckedChange={() => handlePackageToggle(match.package.id)}
                  />
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between pr-8">
                    <div>
                      <CardTitle className="text-lg">{match.package.package_name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        by <span className="font-medium">{match.operator.company}</span>
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{match.match_score}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {match.package.description && (
                    <p className="text-gray-700 text-sm">{match.package.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {match.package.min_duration === match.package.max_duration 
                        ? `${match.package.min_duration} days`
                        : `${match.package.min_duration}-${match.package.max_duration} days`
                      }
                    </Badge>
                    
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {match.package.min_group_size === match.package.max_group_size
                        ? `${match.package.min_group_size} people`
                        : `${match.package.min_group_size}-${match.package.max_group_size} people`
                      }
                    </Badge>
                    
                    <Badge className={getBudgetTierColor(match.package.budget_tier)}>
                      {match.package.budget_tier}
                    </Badge>
                    
                    <Badge variant="outline" className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      ${match.package.estimated_cost_per_person_per_day}/person/day
                    </Badge>
                  </div>

                  {match.package.included_locations && match.package.included_locations.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        Destinations
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {match.package.included_locations.slice(0, 3).map((location, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {location}
                          </Badge>
                        ))}
                        {match.package.included_locations.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{match.package.included_locations.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {match.package.included_activities && match.package.included_activities.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Activities</p>
                      <div className="flex flex-wrap gap-1">
                        {match.package.included_activities.slice(0, 4).map((activity, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {activity}
                          </Badge>
                        ))}
                        {match.package.included_activities.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{match.package.included_activities.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-600">
                {selectedPackages.length} package{selectedPackages.length !== 1 ? 's' : ''} selected
              </p>
              <Button 
                onClick={handleContinue}
                className="bg-orange-600 hover:bg-orange-700"
                disabled={selectedPackages.length === 0}
              >
                Continue with Selected ({selectedPackages.length})
              </Button>
            </div>
          </div>
          
          <div className="text-center pt-4">
            <Button variant="ghost" onClick={onNext} className="text-gray-600">
              Skip this step - Use automatic matching
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default OperatorSelectionStep;
