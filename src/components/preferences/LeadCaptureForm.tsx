
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Users, MapPin, Clock, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { b2cApiService } from '@/services/B2CApiService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const leadCaptureSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  country: z.string().min(2, 'Please select or enter your country'),
  message: z.string().optional(),
});

type LeadCaptureFormData = z.infer<typeof leadCaptureSchema>;

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

interface LeadCaptureFormProps {
  preferences: any;
  schedule: any;
  travel: any;
  dietary: any;
  itinerary?: any;
  onComplete: (result: any) => void;
  onBack: () => void;
}

const POPULAR_COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 
  'France', 'Netherlands', 'Switzerland', 'Sweden', 'Norway', 'Denmark',
  'South Africa', 'Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'Botswana',
  'Namibia', 'Zimbabwe', 'Zambia', 'India', 'China', 'Japan', 'Brazil'
];

const LeadCaptureForm: React.FC<LeadCaptureFormProps> = ({
  preferences,
  schedule,
  travel,
  dietary,
  itinerary,
  onComplete,
  onBack
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCountryInput, setShowCountryInput] = useState(false);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [packageError, setPackageError] = useState<string | null>(null);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<LeadCaptureFormData>({
    resolver: zodResolver(leadCaptureSchema)
  });

  const watchedCountry = watch('country');

  // Fetch matching packages when component loads
  useEffect(() => {
    const fetchMatchingPackages = async () => {
      try {
        console.log('LeadCaptureForm: Fetching matching packages with preferences:', preferences);
        setLoadingPackages(true);
        setPackageError(null);

        const matchingPackages = await b2cApiService.getMatchingPackages(preferences);
        console.log('LeadCaptureForm: Received packages:', matchingPackages);
        
        setPackages(Array.isArray(matchingPackages) ? matchingPackages : []);
      } catch (error) {
        console.error('LeadCaptureForm: Error fetching packages:', error);
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

  const onSubmit = async (formData: LeadCaptureFormData) => {
    setIsSubmitting(true);

    try {
      const leadData = {
        traveler: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          country: formData.country,
          message: formData.message || undefined
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

      console.log('LeadCaptureForm: Submitting lead with data:', {
        travelerInfo: leadData.traveler,
        selectedPackages,
        hasItinerary: !!itinerary
      });

      const result = await b2cApiService.createLead(leadData);
      
      toast.success('Your safari inquiry has been submitted successfully!');
      onComplete(result);
      
    } catch (error) {
      console.error('LeadCaptureForm: Error submitting lead:', error);
      toast.error('Failed to submit your inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Complete Your Safari Request
          </CardTitle>
          <p className="text-center text-gray-600">
            Fill in your details and select operators to receive personalized quotes
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Operator Selection Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Select Safari Operators (Optional)
            </h3>
            
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
          </div>

          {/* Contact Details Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your Contact Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name Field */}
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    {...register('name')}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    {...register('email')}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number (optional)"
                    {...register('phone')}
                  />
                </div>

                {/* Country Field */}
                <div>
                  <Label htmlFor="country">Country *</Label>
                  {!showCountryInput ? (
                    <Select 
                      value={watchedCountry} 
                      onValueChange={(value) => {
                        if (value === 'other') {
                          setShowCountryInput(true);
                          setValue('country', '');
                        } else {
                          setValue('country', value);
                        }
                      }}
                    >
                      <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {POPULAR_COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                        <SelectItem value="other">Other (type manually)</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter your country"
                        {...register('country')}
                        className={errors.country ? 'border-red-500' : ''}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowCountryInput(false);
                          setValue('country', '');
                        }}
                      >
                        Back to List
                      </Button>
                    </div>
                  )}
                  {errors.country && (
                    <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                  )}
                </div>
              </div>

              {/* Additional Message Field */}
              <div className="mt-4">
                <Label htmlFor="message">Additional Notes or Special Requests</Label>
                <Textarea
                  id="message"
                  placeholder="Any special requests, dietary requirements, accessibility needs, or additional information you'd like to share..."
                  rows={4}
                  {...register('message')}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Optional: Help us personalize your safari experience
                </p>
              </div>
            </div>

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
                type="submit"
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadCaptureForm;
