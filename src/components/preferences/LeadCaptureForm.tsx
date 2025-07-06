
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { b2cApiService } from '@/services/B2CApiService';

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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const leadData = {
        traveler: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          country: formData.country || undefined
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

      console.log('Submitting lead with selected packages:', selectedPackages);

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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                  <SelectItem value="FR">France</SelectItem>
                  <SelectItem value="KE">Kenya</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
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
