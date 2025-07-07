
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
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

interface LeadCaptureFormProps {
  preferences: any;
  schedule: any;
  travel: any;
  dietary: any;
  selectedPackages: string[];
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
  selectedPackages,
  itinerary,
  onComplete,
  onBack
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCountryInput, setShowCountryInput] = useState(false);

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

      console.log('Submitting lead with enquirer details:', {
        selectedPackages,
        travelerInfo: leadData.traveler
      });

      const result = await b2cApiService.createLead(leadData);
      
      toast.success('Your safari inquiry has been submitted successfully!');
      onComplete(result);
      
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast.error('Failed to submit your inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            {selectedPackages.length > 0 
              ? `Complete Your Request - ${selectedPackages.length} Package${selectedPackages.length !== 1 ? 's' : ''} Selected`
              : 'Complete Your Safari Request'
            }
          </CardTitle>
          <p className="text-center text-gray-600">
            {selectedPackages.length > 0
              ? 'Your selected operators will receive your customized inquiry directly.'
              : 'We\'ll match you with the best safari operators for your needs.'
            }
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

            {/* Additional Message Field */}
            <div>
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

            {/* Selected Packages Summary */}
            {selectedPackages.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Selected Packages ({selectedPackages.length})
                </h4>
                <p className="text-sm text-blue-700">
                  Your inquiry will be sent directly to the operators of your selected packages.
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
                  'Submit Safari Request'
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
