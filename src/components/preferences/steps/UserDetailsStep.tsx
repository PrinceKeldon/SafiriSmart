
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserDetails } from '../WizardTypes';

const userDetailsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  country: z.string().min(2, 'Please select or enter your country'),
  message: z.string().optional(),
});

const POPULAR_COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 
  'France', 'Netherlands', 'Switzerland', 'Sweden', 'Norway', 'Denmark',
  'South Africa', 'Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'Botswana',
  'Namibia', 'Zimbabwe', 'Zambia', 'India', 'China', 'Japan', 'Brazil'
];

interface UserDetailsStepProps {
  value: UserDetails;
  onChange: (details: UserDetails) => void;
  onNext: () => void;
  onBack: () => void;
}

export const UserDetailsStep: React.FC<UserDetailsStepProps> = ({
  value,
  onChange,
  onNext,
  onBack
}) => {
  const [showCountryInput, setShowCountryInput] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<UserDetails>({
    resolver: zodResolver(userDetailsSchema),
    defaultValues: value,
    mode: 'onChange'
  });

  const watchedCountry = watch('country');

  const onSubmit = (data: UserDetails) => {
    onChange(data);
    onNext();
  };

  React.useEffect(() => {
    const subscription = watch((formData) => {
      if (formData.name && formData.email && formData.country) {
        onChange({
          name: formData.name || '',
          email: formData.email || '',
          phone: formData.phone || '',
          country: formData.country || '',
          message: formData.message || ''
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your Contact Details
        </h2>
        <p className="text-gray-600">
          Please provide your information so we can send you personalized safari quotes
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
        <div>
          <Label htmlFor="message">Additional Notes or Special Requests</Label>
          <Textarea
            id="message"
            placeholder="Any special requests, dietary requirements, accessibility needs, or additional information..."
            rows={4}
            {...register('message')}
          />
          <p className="text-sm text-gray-500 mt-1">
            Optional: Help us personalize your safari experience
          </p>
        </div>

        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
          >
            Back
          </Button>
          
          <Button
            type="submit"
            disabled={!isValid}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Continue to Operator Selection
          </Button>
        </div>
      </form>
    </div>
  );
};
