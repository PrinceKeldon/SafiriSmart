
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Users, Clock, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { b2cApiService } from '@/services/B2CApiService';
import { UserDetails } from '../WizardTypes';

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

interface FinalOperatorSelectionStepProps {
  preferences: any;
  schedule: any;
  travel: any;
  dietary: any;
  userDetails: UserDetails;
  itinerary?: any;
  onComplete: (result: any) => void;
  onBack: () => void;
}

export const FinalOperatorSelectionStep: React.FC<FinalOperatorSelectionStepProps> = ({
  preferences,
  schedule,
  travel,
  dietary,
  userDetails,
  itinerary,
  onComplete,
  onBack
}) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [packageError, setPackageError] = useState<string | null>(null);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch matching packages when component loads
  useEffect(() => {
    const fetchMatchingPackages = async () => {
      try {
        console.log('FinalOperatorSelectionStep: Fetching matching packages with preferences:', preferences);
        setLoadingPackages(true);
        setPackageError(null);

        const matchingPackages = await b2cApiService.getMatchingPackages(preferences);
        console.log('FinalOperatorSelectionStep: Received packages:', matchingPackages);
        
        setPackages(Array.isArray(matchingPackages) ? matchingPackages : []);
      } catch (error) {
        console.error('FinalOperatorSelectionStep: Error fetching packages:', error);
        setPackageError('Unable to load operator packages. You can still submit your inquiry.');
        setPackages([]);
      } finally {
        setLoadingPackages(false);
      }
    };

    fetchMatchingPackages();
  }, [preferences]);

  const handlePackageToggle = (packageId: string) => {
    setSelectedPackages(prev => 
      prev.includes(packageId)
        ? prev.filter(id => id !== packageId)
        : [...prev, packageId]
    );
  };

  const getBudgetTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'budget': return 'bg-green-100 text-green-800';
      case 'mid-range': return 'bg-blue-100 text-blue-800';  
      case 'luxury': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const leadData = {
        traveler: {
          name: userDetails.name,
          email: userDetails.email,
          phone: userDetails.phone || undefined,
          country: userDetails.country,
          message: userDetails.message || undefined
        },
        preferences: {
          ...preferences,
          selectedPackages: selectedPackages.length > 0 ? selectedPackages : undefined
        },
        schedule,
        travel,
        dietary,
        itinerary
      };

      console.log('FinalOperatorSelectionStep: Submitting lead with data:', {
        travelerInfo: leadData.traveler,
        selectedPackages,
        hasItinerary: !!itinerary
      });

      const result = await b2cApiService.createLead(leadData);
      
      toast.success('Your safari inquiry has been submitted successfully!');
      onComplete(result);
      
    } catch (error) {
      console.error('FinalOperatorSelectionStep: Error submitting lead:', error);
      toast.error('Failed to submit your inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select Safari Operators
        </h2>
        <p className="text-gray-600">
          Choose operators to receive your personalized safari inquiry
        </p>
      </div>

      {loadingPackages ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Finding matching safari operators...</span>
        </div>
      ) : packageError ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {packageError}
          </AlertDescription>
        </Alert>
      ) : packages.length > 0 ? (
        <>
          <p className="text-sm text-gray-600">
            Found {packages.length} matching package{packages.length !== 1 ? 's' : ''}. Select operators to receive direct quotes:
          </p>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={pkg.id}
                      checked={selectedPackages.includes(pkg.id)}
                      onCheckedChange={() => handlePackageToggle(pkg.id)}
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-base">{pkg.package_name}</h4>
                          <p className="text-gray-600 text-sm font-medium">{pkg.operator_company}</p>
                        </div>
                        <Badge className={getBudgetTierColor(pkg.budget_tier)}>
                          {pkg.budget_tier}
                        </Badge>
                      </div>
                      
                      {pkg.description && (
                        <p className="text-gray-700 text-sm">{pkg.description}</p>
                      )}
                      
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-3 h-3 mr-1" />
                          {pkg.min_duration === pkg.max_duration 
                            ? `${pkg.min_duration} days`
                            : `${pkg.min_duration}-${pkg.max_duration} days`
                          }
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="w-3 h-3 mr-1" />
                          {pkg.min_group_size === pkg.max_group_size
                            ? `${pkg.min_group_size} people`
                            : `${pkg.min_group_size}-${pkg.max_group_size} people`
                          }
                        </div>
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="w-3 h-3 mr-1" />
                          ${pkg.estimated_cost_per_person_per_day}/day
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedPackages.length > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                You've selected {selectedPackages.length} operator{selectedPackages.length !== 1 ? 's' : ''}. 
                Your inquiry will be sent directly to them.
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Don't see what you're looking for?</strong> Don't worry! If you don't select specific operators, 
              we'll match you with the best safari operators for your preferences.
            </p>
          </div>
        </>
      ) : (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <h4 className="font-medium text-gray-900 mb-2">No Specific Packages Available</h4>
          <p className="text-gray-600 text-sm">
            We'll match you with suitable operators based on your preferences.
          </p>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Back
        </Button>
        
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-orange-600 hover:bg-orange-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            selectedPackages.length > 0 
              ? `Submit to ${selectedPackages.length} Selected Operator${selectedPackages.length !== 1 ? 's' : ''}`
              : 'Submit Safari Request'
          )}
        </Button>
      </div>
    </div>
  );
};
