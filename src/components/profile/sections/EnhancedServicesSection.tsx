
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X, Briefcase } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { useUpdateOperatorProfile } from '@/hooks/useOperatorProfile';
import { toast } from 'sonner';
import { SERVICES_OPTIONS, DESTINATIONS_OPTIONS } from '../constants/ProfileConstants';

type OperatorRow = Tables<'operators'>;

interface EnhancedServicesSectionProps {
  profile: OperatorRow | undefined;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
}

export const EnhancedServicesSection: React.FC<EnhancedServicesSectionProps> = ({
  profile,
  isEditing,
  onEdit,
  onCancel
}) => {
  const updateProfile = useUpdateOperatorProfile();
  const [selectedServices, setSelectedServices] = useState<string[]>(
    Array.isArray(profile?.services_offered) ? profile.services_offered as string[] : []
  );
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(
    Array.isArray(profile?.destinations_covered) ? profile.destinations_covered as string[] : []
  );

  React.useEffect(() => {
    if (profile && isEditing) {
      setSelectedServices(Array.isArray(profile.services_offered) ? profile.services_offered as string[] : []);
      setSelectedDestinations(Array.isArray(profile.destinations_covered) ? profile.destinations_covered as string[] : []);
    }
  }, [profile, isEditing]);

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const handleDestinationToggle = (destination: string) => {
    setSelectedDestinations(prev =>
      prev.includes(destination)
        ? prev.filter(d => d !== destination)
        : [...prev, destination]
    );
  };

  const onSubmit = async () => {
    try {
      await updateProfile.mutateAsync({
        services_offered: selectedServices,
        destinations_covered: selectedDestinations,
      });
      toast.success('Services and destinations updated successfully');
      onCancel();
    } catch (error) {
      toast.error('Failed to update services and destinations');
    }
  };

  const hasData = (Array.isArray(profile?.services_offered) && profile.services_offered.length > 0) || 
                  (Array.isArray(profile?.destinations_covered) && profile.destinations_covered.length > 0);

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Services & Destinations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-3 block">Services Offered</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SERVICES_OPTIONS.map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    id={`service-${service}`}
                    checked={selectedServices.includes(service)}
                    onCheckedChange={() => handleServiceToggle(service)}
                  />
                  <label
                    htmlFor={`service-${service}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {service}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Destinations Covered</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {DESTINATIONS_OPTIONS.map((destination) => (
                <div key={destination} className="flex items-center space-x-2">
                  <Checkbox
                    id={`destination-${destination}`}
                    checked={selectedDestinations.includes(destination)}
                    onCheckedChange={() => handleDestinationToggle(destination)}
                  />
                  <label
                    htmlFor={`destination-${destination}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {destination}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={onSubmit} disabled={updateProfile.isPending}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
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
            {Array.isArray(profile?.services_offered) && profile.services_offered.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Services Offered</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {(profile.services_offered as string[]).map((service, index) => (
                    <Badge key={index} variant="outline">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {Array.isArray(profile?.destinations_covered) && profile.destinations_covered.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Destinations Covered</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {(profile.destinations_covered as string[]).map((destination, index) => (
                    <Badge key={index} variant="outline">
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
            <p className="text-muted-foreground">No services or destinations selected yet.</p>
            <Button variant="outline" className="mt-2" onClick={onEdit}>
              Select Services & Destinations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
