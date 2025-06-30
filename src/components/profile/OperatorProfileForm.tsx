
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUploadField } from './FileUploadField';
import { useOperatorProfile, useUpdateOperatorProfile } from '@/hooks/useOperatorProfile';
import { OperatorProfileUpdate } from '@/types/operator';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registration_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter registration number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your company, services, and expertise..." 
                        className="min-h-24"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter company address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Kenya">Kenya</SelectItem>
                          <SelectItem value="Tanzania">Tanzania</SelectItem>
                          <SelectItem value="Uganda">Uganda</SelectItem>
                          <SelectItem value="Rwanda">Rwanda</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contact_person_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact person name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_person_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Compliance Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="certificate_of_incorporation_url"
                render={({ field }) => (
                  <FormItem>
                    <FileUploadField
                      label="Certificate of Incorporation"
                      currentUrl={field.value}
                      onUrlChange={(url) => field.onChange(url || '')}
                      disabled={updateProfile.isPending}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="business_permit_url"
                render={({ field }) => (
                  <FormItem>
                    <FileUploadField
                      label="Business Permit"
                      currentUrl={field.value}
                      onUrlChange={(url) => field.onChange(url || '')}
                      disabled={updateProfile.isPending}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="kato_membership_url"
                render={({ field }) => (
                  <FormItem>
                    <FileUploadField
                      label="KATO Membership Certificate"
                      currentUrl={field.value}
                      onUrlChange={(url) => field.onChange(url || '')}
                      disabled={updateProfile.isPending}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

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
