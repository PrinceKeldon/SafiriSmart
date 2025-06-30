
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Phone, User, MessageCircle, ArrowLeft, Send, Loader2 } from 'lucide-react';
import { TravelPreferences, TourOutput } from './WizardTypes';
import { b2cApiService } from '@/services/B2CApiService';

interface LeadCaptureFormProps {
  itinerary: TourOutput;
  preferences: TravelPreferences;
  onBackToPreferences: () => void;
}

export const LeadCaptureForm: React.FC<LeadCaptureFormProps> = ({ itinerary, preferences, onBackToPreferences }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [message, setMessage] = useState('');
  const [subscribe, setSubscribe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus('idle');
    setErrorMessage('');

    // Basic form validation
    if (!name || !email) {
      setSubmissionStatus('error');
      setErrorMessage('Please fill in your name and email.');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Submitting lead to B2B Backend...');
      
      const leadData = {
        traveler: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          country: country.trim() || undefined,
        },
        preferences: {
          duration: preferences.duration,
          budgetRange: preferences.budgetRange,
          interests: preferences.interests,
          groupSize: preferences.groupSize,
          travelPace: preferences.travelPace,
          languages: preferences.languages,
        },
        schedule: preferences.schedule,
        travel: preferences.travel,
        dietary: preferences.dietary,
        itinerary: itinerary,
        additionalNotes: message.trim() || undefined,
        marketingConsent: subscribe,
      };

      const response = await b2cApiService.createLead(leadData);
      
      console.log('Lead created successfully:', response);
      setSubmissionStatus('success');
      
      // Reset form fields
      setName('');
      setEmail('');
      setPhone('');
      setCountry('');
      setMessage('');
      setSubscribe(false);
      
    } catch (error) {
      console.error('Lead submission error:', error);
      setSubmissionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit your inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">
          Let's Start Planning!
        </CardTitle>
        <Button variant="outline" size="icon" onClick={onBackToPreferences}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {submissionStatus === 'success' ? (
          <div className="text-center p-6">
            <h4 className="text-xl font-semibold text-green-600 mb-4">
              Thank You!
            </h4>
            <p className="text-gray-600 mb-4">
              We've received your safari inquiry and will be in touch soon to discuss your adventure.
            </p>
            <p className="text-sm text-gray-500">
              A safari expert will contact you within 24 hours to customize your {preferences.duration}-day {itinerary.tour_name}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium block mb-2">
                Your Name *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email" className="text-sm font-medium block mb-2">
                Your Email *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  id="email"
                  placeholder="john.doe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="phone" className="text-sm font-medium block mb-2">
                Phone Number (Optional)
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="tel"
                  id="phone"
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="country" className="text-sm font-medium block mb-2">
                Country (Optional)
              </Label>
              <Input
                type="text"
                id="country"
                placeholder="United States"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="message" className="text-sm font-medium block mb-2">
                Additional Notes
              </Label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Textarea
                  id="message"
                  placeholder="Anything else we should know about your safari preferences?"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="subscribe"
                checked={subscribe}
                onCheckedChange={(checked) => setSubscribe(!!checked)}
              />
              <Label htmlFor="subscribe" className="text-sm font-medium cursor-pointer">
                Subscribe to our newsletter for safari tips and exclusive offers
              </Label>
            </div>
            
            <div>
              <Button disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Inquiry...
                  </>
                ) : (
                  <>
                    Send Safari Inquiry
                    <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              
              {submissionStatus === 'error' && (
                <p className="text-sm text-red-500 mt-2">
                  {errorMessage}
                </p>
              )}
            </div>
            
            <div className="text-xs text-gray-500 text-center">
              By submitting this form, you agree to be contacted by our safari experts regarding your inquiry.
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
