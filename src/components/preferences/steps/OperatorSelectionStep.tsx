
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, MapPin, Users, Clock, DollarSign, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Package {
  id: string;
  package_name: string;
  operator_company: string;
  description?: string;
  budget_tier: string;
  min_duration: number;
  max_duration: number;
  min_group_size: number;
  max_group_size: number;
  estimated_cost_per_person_per_day: number;
  included_locations?: string[];
  included_activities?: string[];
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
  onBack,
}) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatchingPackages = async () => {
      try {
        console.log('OperatorSelectionStep: Fetching packages with preferences:', preferences);
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          duration: preferences.duration?.toString() || '7',
          budget_range: preferences.budgetRange || 'mid-range',
          interests: Array.isArray(preferences.interests) ? preferences.interests.join(',') : (preferences.interests || 'wildlife-safari'),
          group_size: preferences.groupSize?.toString() || '2',
          travel_pace: preferences.travelPace || 'moderate',
          languages: Array.isArray(preferences.languages) ? preferences.languages.join(',') : (preferences.languages || 'English')
        });

        console.log('OperatorSelectionStep: Making request with params:', params.toString());

        // Try to fetch from the B2B backend
        const response = await fetch(`http://localhost:8001/api/packages/match?${params}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('OperatorSelectionStep: Received packages:', data);
        
        setPackages(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching matching packages:', error);
        setError('Unable to load operator packages. You can continue without selecting specific packages.');
        // Set empty packages array so the user can still proceed
        setPackages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchingPackages();
  }, [preferences]);

  const handlePackageToggle = (packageId: string) => {
    const newSelection = selectedPackages.includes(packageId)
      ? selectedPackages.filter(id => id !== packageId)
      : [...selectedPackages, packageId];
    
    console.log('OperatorSelectionStep: Package selection changed:', newSelection);
    onPackageSelectionChange(newSelection);
  };

  const getBudgetTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'budget': return 'bg-green-100 text-green-800';
      case 'mid-range': return 'bg-blue-100 text-blue-800';
      case 'luxury': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Choose Safari Operators
          </h2>
          <p className="text-gray-600">
            Finding the best safari packages for your preferences...
          </p>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Safari Operators
        </h2>
        <p className="text-gray-600">
          Select specific packages/operators you'd like to receive quotes from, or skip to connect with our recommended operators.
        </p>
      </div>

      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {packages.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Found {packages.length} matching package{packages.length !== 1 ? 's' : ''}. 
            Select the ones you're interested in:
          </p>
          
          {packages.map((pkg) => (
            <Card key={pkg.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Checkbox
                    id={pkg.id}
                    checked={selectedPackages.includes(pkg.id)}
                    onCheckedChange={() => handlePackageToggle(pkg.id)}
                  />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{pkg.package_name}</h3>
                        <p className="text-gray-600 font-medium">{pkg.operator_company}</p>
                      </div>
                      <Badge className={getBudgetTierColor(pkg.budget_tier)}>
                        {pkg.budget_tier}
                      </Badge>
                    </div>
                    
                    {pkg.description && (
                      <p className="text-gray-700 text-sm">{pkg.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {pkg.min_duration === pkg.max_duration 
                          ? `${pkg.min_duration} days`
                          : `${pkg.min_duration}-${pkg.max_duration} days`
                        }
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-1" />
                        {pkg.min_group_size === pkg.max_group_size
                          ? `${pkg.min_group_size} people`
                          : `${pkg.min_group_size}-${pkg.max_group_size} people`
                        }
                      </div>
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="w-4 h-4 mr-1" />
                        ${pkg.estimated_cost_per_person_per_day}/day
                      </div>
                      {pkg.included_locations && pkg.included_locations.length > 0 && (
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-1" />
                          {pkg.included_locations.slice(0, 2).join(', ')}
                          {pkg.included_locations.length > 2 && '...'}
                        </div>
                      )}
                    </div>
                    
                    {pkg.included_activities && pkg.included_activities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {pkg.included_activities.slice(0, 3).map((activity, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {activity}
                          </Badge>
                        ))}
                        {pkg.included_activities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{pkg.included_activities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {selectedPackages.length > 0 && (
            <Alert>
              <AlertDescription>
                You've selected {selectedPackages.length} package{selectedPackages.length !== 1 ? 's' : ''}. 
                Your inquiry will be sent directly to these operators.
              </AlertDescription>
            </Alert>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Packages Available
            </h3>
            <p className="text-gray-600">
              We couldn't load specific packages right now, but you can still continue. 
              Our system will match you with suitable operators based on your preferences.
            </p>
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-between pt-6">
        <Button
          onClick={onBack}
          variant="outline"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          className="bg-orange-600 hover:bg-orange-700"
        >
          {selectedPackages.length > 0 
            ? `Continue with ${selectedPackages.length} Selected`
            : 'Continue Without Selection'
          }
        </Button>
      </div>
    </div>
  );
};

export default OperatorSelectionStep;
