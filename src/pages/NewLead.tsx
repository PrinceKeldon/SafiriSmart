
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ManualLeadForm } from '@/components/leads/ManualLeadForm';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Form schema matching the backend CreateLeadRequest with new fields
const manualLeadSchema = z.object({
  traveler: z.object({
    name: z.string().min(1, 'Traveler name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().optional(),
    country: z.string().optional(),
  }),
  preferences: z.object({
    duration: z.number().min(1, 'Duration must be at least 1 day').max(21, 'Duration cannot exceed 21 days'),
    budgetRange: z.enum(['budget', 'mid-range', 'luxury']),
    interests: z.array(z.string()).min(1, 'At least one interest must be selected'),
    groupSize: z.number().min(1, 'Group size must be at least 1').max(20, 'Group size cannot exceed 20'),
    travelPace: z.enum(['relaxed', 'moderate', 'active']),
    languages: z.array(z.string()).min(1, 'At least one language must be selected'),
  }),
  schedule: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    flexible: z.boolean().default(true),
  }),
  travel: z.object({
    portOfEntry: z.string().optional(),
    airportPickup: z.boolean().default(false),
    pickupTime: z.string().optional(),
    pickupLocation: z.string().optional(),
  }),
  dietary: z.object({
    mealWishes: z.string().optional(),
    allergies: z.string().optional(),
    specialRequirements: z.string().optional(),
  }),
});

type ManualLeadFormData = z.infer<typeof manualLeadSchema>;

const NewLead = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ManualLeadFormData>({
    resolver: zodResolver(manualLeadSchema),
    defaultValues: {
      traveler: {
        name: '',
        email: '',
        phone: '',
        country: '',
      },
      preferences: {
        duration: 7,
        budgetRange: 'mid-range',
        interests: [],
        groupSize: 2,
        travelPace: 'moderate',
        languages: ['English'],
      },
      schedule: {
        flexible: true,
        startDate: '',
        endDate: '',
      },
      travel: {
        portOfEntry: '',
        airportPickup: false,
        pickupTime: '',
        pickupLocation: '',
      },
      dietary: {
        mealWishes: '',
        allergies: '',
        specialRequirements: '',
      },
    },
  });

  const onSubmit = async (data: ManualLeadFormData) => {
    console.log('Form submission started with data:', data);
    setIsSubmitting(true);
    
    try {
      // Convert date strings to Date objects if they exist
      const processedData = {
        ...data,
        schedule: {
          ...data.schedule,
          startDate: data.schedule.startDate ? new Date(data.schedule.startDate) : undefined,
          endDate: data.schedule.endDate ? new Date(data.schedule.endDate) : undefined,
        }
      };

      console.log('Processed data for submission:', processedData);

      const { data: result, error } = await supabase.functions.invoke('create-lead', {
        body: processedData
      });

      console.log('Supabase function result:', result);
      console.log('Supabase function error:', error);

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!result || !result.success) {
        console.error('Lead creation failed:', result);
        throw new Error(result?.error || 'Failed to create lead');
      }
      
      toast.success('Lead created successfully!');
      console.log('Lead created successfully, navigating to dashboard');
      
      // Redirect back to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error creating lead:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create lead. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Lead</h1>
            <p className="text-gray-600">Add a manual lead and generate an AI-powered itinerary</p>
          </div>
        </div>

        {/* Form */}
        <Card className="max-w-4xl">
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <ManualLeadForm form={form} />
                
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Lead...
                      </>
                    ) : (
                      'Create Lead & Generate Itinerary'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NewLead;
