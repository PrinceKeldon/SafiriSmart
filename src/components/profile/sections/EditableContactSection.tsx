import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Save, X, MapPin } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { useUpdateOperatorProfile } from '@/hooks/useOperatorProfile';
import { toast } from 'sonner';

type OperatorRow = Tables<'operators'>;

interface EditableContactSectionProps {
  profile: OperatorRow | undefined;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
}

const contactSchema = z.object({
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  contact_person_name: z.string().optional(),
  contact_person_phone: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

export const EditableContactSection: React.FC<EditableContactSectionProps> = ({
  profile,
  isEditing,
  onEdit,
  onCancel
}) => {
  const updateProfile = useUpdateOperatorProfile();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      address: profile?.address || '',
      city: profile?.city || '',
      country: profile?.country || 'Kenya',
      contact_person_name: profile?.contact_person_name || '',
      contact_person_phone: profile?.contact_person_phone || '',
    },
  });

  React.useEffect(() => {
    if (profile && isEditing) {
      form.reset({
        address: profile.address || '',
        city: profile.city || '',
        country: profile.country || 'Kenya',
        contact_person_name: profile.contact_person_name || '',
        contact_person_phone: profile.contact_person_phone || '',
      });
    }
  }, [profile, isEditing, form]);

  const onSubmit = async (data: ContactFormData) => {
    try {
      await updateProfile.mutateAsync(data);
      toast.success('Contact information updated successfully');
      onCancel();
    } catch (error) {
      toast.error('Failed to update contact information');
    }
  };

  const hasData = profile?.address || profile?.city || profile?.contact_person_name || profile?.contact_person_phone;

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <MapPin className="w-5 h-5" />
            Contact Information
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
            {profile?.address && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Address</label>
                <p className="text-sm">{profile.address}</p>
              </div>
            )}
            {(profile?.city || profile?.country) && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <p className="text-sm">{[profile?.city, profile?.country].filter(Boolean).join(', ')}</p>
              </div>
            )}
            {profile?.contact_person_name && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contact Person</label>
                <p className="text-sm">{profile.contact_person_name}</p>
              </div>
            )}
            {profile?.contact_person_phone && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="text-sm">{profile.contact_person_phone}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No contact information added yet.</p>
            <Button variant="outline" className="mt-2" onClick={onEdit}>
              Add Contact Information
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};