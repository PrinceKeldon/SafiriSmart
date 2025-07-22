
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, X, Building } from 'lucide-react';
import { OperatorProfile } from '@/types/operator';
import { useUpdateOperatorProfile } from '@/hooks/useOperatorProfile';
import { toast } from 'sonner';

interface EditableCompanySectionProps {
  profile: OperatorProfile;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
}

const companySchema = z.object({
  company_name: z.string().optional(),
  registration_number: z.string().optional(),
  website_url: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

export const EditableCompanySection: React.FC<EditableCompanySectionProps> = ({
  profile,
  isEditing,
  onEdit,
  onCancel
}) => {
  const updateProfile = useUpdateOperatorProfile();

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      company_name: profile.company_name || '',
      registration_number: profile.registration_number || '',
      website_url: profile.website_url || '',
      description: profile.description || '',
    },
  });

  React.useEffect(() => {
    if (profile && isEditing) {
      form.reset({
        company_name: profile.company_name || '',
        registration_number: profile.registration_number || '',
        website_url: profile.website_url || '',
        description: profile.description || '',
      });
    }
  }, [profile, isEditing, form]);

  const onSubmit = async (data: CompanyFormData) => {
    try {
      await updateProfile.mutateAsync(data);
      toast.success('Company information updated successfully');
      onCancel();
    } catch (error) {
      toast.error('Failed to update company information');
    }
  };

  const hasData = profile.company_name || profile.registration_number || profile.website_url || profile.description;

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your company and services" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button type="submit" disabled={updateProfile.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Company Information
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="space-y-3">
            {profile.company_name && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                <p className="text-sm">{profile.company_name}</p>
              </div>
            )}
            {profile.registration_number && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Registration Number</label>
                <p className="text-sm">{profile.registration_number}</p>
              </div>
            )}
            {profile.website_url && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Website</label>
                <p className="text-sm">
                  <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {profile.website_url}
                  </a>
                </p>
              </div>
            )}
            {profile.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm">{profile.description}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <Building className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No company information added yet.</p>
            <Button variant="outline" className="mt-2" onClick={onEdit}>
              Add Company Information
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
