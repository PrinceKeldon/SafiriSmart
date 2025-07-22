
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Edit, Save, X, MapPin, Briefcase, Plus, Trash2 } from 'lucide-react';
import { OperatorProfile } from '@/types/operator';
import { useUpdateOperatorProfile } from '@/hooks/useOperatorProfile';
import { toast } from 'sonner';

interface EnhancedServicesSectionProps {
  profile: OperatorProfile;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
}

const servicesSchema = z.object({
  services_offered: z.array(z.string()).optional(),
  destinations_covered: z.array(z.string()).optional(),
});

type ServicesFormData = z.infer<typeof servicesSchema>;

export const EnhancedServicesSection: React.FC<EnhancedServicesSectionProps> = ({
  profile,
  isEditing,
  onEdit,
  onCancel
}) => {
  const updateProfile = useUpdateOperatorProfile();
  const [newService, setNewService] = React.useState('');
  const [newDestination, setNewDestination] = React.useState('');

  const form = useForm<ServicesFormData>({
    resolver: zodResolver(servicesSchema),
    defaultValues: {
      services_offered: profile.services_offered || [],
      destinations_covered: profile.destinations_covered || [],
    },
  });

  React.useEffect(() => {
    if (profile && isEditing) {
      form.reset({
        services_offered: profile.services_offered || [],
        destinations_covered: profile.destinations_covered || [],
      });
    }
  }, [profile, isEditing, form]);

  const addService = () => {
    if (newService.trim()) {
      const currentServices = form.getValues('services_offered') || [];
      form.setValue('services_offered', [...currentServices, newService.trim()]);
      setNewService('');
    }
  };

  const removeService = (index: number) => {
    const currentServices = form.getValues('services_offered') || [];
    form.setValue('services_offered', currentServices.filter((_, i) => i !== index));
  };

  const addDestination = () => {
    if (newDestination.trim()) {
      const currentDestinations = form.getValues('destinations_covered') || [];
      form.setValue('destinations_covered', [...currentDestinations, newDestination.trim()]);
      setNewDestination('');
    }
  };

  const removeDestination = (index: number) => {
    const currentDestinations = form.getValues('destinations_covered') || [];
    form.setValue('destinations_covered', currentDestinations.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ServicesFormData) => {
    try {
      await updateProfile.mutateAsync(data);
      toast.success('Services and destinations updated successfully');
      onCancel();
    } catch (error) {
      toast.error('Failed to update services and destinations');
    }
  };

  const hasData = (profile.services_offered && profile.services_offered.length > 0) || 
                  (profile.destinations_covered && profile.destinations_covered.length > 0);

  if (isEditing) {
    const watchedServices = form.watch('services_offered') || [];
    const watchedDestinations = form.watch('destinations_covered') || [];

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Services & Destinations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Services Section */}
              <div className="space-y-3">
                <FormLabel>Services Offered</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a service"
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                  />
                  <Button type="button" onClick={addService} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {watchedServices.map((service, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {service}
                      <button
                        type="button"
                        onClick={() => removeService(index)}
                        className="ml-1 hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Destinations Section */}
              <div className="space-y-3">
                <FormLabel>Destinations Covered</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a destination"
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDestination())}
                  />
                  <Button type="button" onClick={addDestination} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {watchedDestinations.map((destination, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {destination}
                      <button
                        type="button"
                        onClick={() => removeDestination(index)}
                        className="ml-1 hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
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
            <Briefcase className="w-5 h-5" />
            Services & Destinations
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="space-y-4">
            {profile.services_offered && profile.services_offered.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Services Offered</label>
                <div className="flex flex-wrap gap-2">
                  {profile.services_offered.map((service, index) => (
                    <Badge key={index} variant="outline">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {profile.destinations_covered && profile.destinations_covered.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Destinations Covered</label>
                <div className="flex flex-wrap gap-2">
                  {profile.destinations_covered.map((destination, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {destination}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No services or destinations added yet.</p>
            <Button variant="outline" className="mt-2" onClick={onEdit}>
              Add Services & Destinations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
