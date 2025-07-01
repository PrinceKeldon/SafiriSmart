
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useOperatorProfile, useUpdateOperatorProfile } from '@/hooks/useOperatorProfile';
import { OperatorProfileUpdate } from '@/types/operator';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { CompanyInformationSection } from './sections/CompanyInformationSection';
import { ContactInformationSection } from './sections/ContactInformationSection';
import { ComplianceDocumentsSection } from './sections/ComplianceDocumentsSection';

const profileSchema = z.object({
  company_name: z.string().optional(),
  registration_number: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  contact_person_name: z.string().optional(),
  contact_person_phone: z.string().optional(),
  website_url: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  certificate_of_incorporation_url: z.string().optional(),
  business_permit_url: z.string().optional(),
  kato_membership_url: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const OperatorProfileForm: React.FC = () => {
  const { data: profile, isLoading } = useOperatorProfile();
  const updateProfile = useUpdateOperatorProfile();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      company_name: '',
      registration_number: '',
      address: '',
      city: '',
      country: 'Kenya',
      contact_person_name: '',
      contact_person_phone: '',
      website_url: '',
      description: '',
      certificate_of_incorporation_url: '',
      business_permit_url: '',
      kato_membership_url: '',
    },
  });

  React.useEffect(() => {
    if (profile) {
      form.reset({
        company_name: profile.company_name || '',
        registration_number: profile.registration_number || '',
        address: profile.address || '',
        city: profile.city || '',
        country: profile.country || 'Kenya',
        contact_person_name: profile.contact_person_name || '',
        contact_person_phone: profile.contact_person_phone || '',
        website_url: profile.website_url || '',
        description: profile.description || '',
        certificate_of_incorporation_url: profile.certificate_of_incorporation_url || '',
        business_permit_url: profile.business_permit_url || '',
        kato_membership_url: profile.kato_membership_url || '',
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const updateData: OperatorProfileUpdate = {};
      
      // Only include fields that have values
      Object.entries(data).forEach(([key, value]) => {
        if (value !== '' && value !== undefined) {
          updateData[key as keyof OperatorProfileUpdate] = value;
        }
      });

      await updateProfile.mutateAsync(updateData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Company Profile</h1>
        <p className="text-gray-600">Manage your company details and compliance documents</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CompanyInformationSection form={form} />
          <ContactInformationSection form={form} />
          <ComplianceDocumentsSection form={form} isPending={updateProfile.isPending} />

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={updateProfile.isPending}
              className="min-w-32"
            >
              {updateProfile.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
