import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X, Plus, Trash2, Briefcase } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { useUpdateOperatorProfile } from '@/hooks/useOperatorProfile';
import { toast } from 'sonner';

type OperatorRow = Tables<'operators'>;

interface EditableServicesSectionProps {
  profile: OperatorRow | undefined;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
}

export const EditableServicesSection: React.FC<EditableServicesSectionProps> = ({
  profile,
  isEditing,
  onEdit,
  onCancel
}) => {
  const updateProfile = useUpdateOperatorProfile();
  const [services, setServices] = useState<string[]>(
    Array.isArray(profile?.services_offered) ? profile.services_offered as string[] : []
  );
  const [destinations, setDestinations] = useState<string[]>(
    Array.isArray(profile?.destinations_covered) ? profile.destinations_covered as string[] : []
  );
  const [newService, setNewService] = useState('');
  const [newDestination, setNewDestination] = useState('');

  React.useEffect(() => {
    if (profile && isEditing) {
      setServices(Array.isArray(profile.services_offered) ? profile.services_offered as string[] : []);
      setDestinations(Array.isArray(profile.destinations_covered) ? profile.destinations_covered as string[] : []);
    }
  }, [profile, isEditing]);

  const addService = () => {
    if (newService.trim() && !services.includes(newService.trim())) {
      setServices([...services, newService.trim()]);
      setNewService('');
    }
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const addDestination = () => {
    if (newDestination.trim() && !destinations.includes(newDestination.trim())) {
      setDestinations([...destinations, newDestination.trim()]);
      setNewDestination('');
    }
  };

  const removeDestination = (index: number) => {
    setDestinations(destinations.filter((_, i) => i !== index));
  };

  const onSubmit = async () => {
    try {
      await updateProfile.mutateAsync({
        services_offered: services,
        destinations_covered: destinations,
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
            <label className="text-sm font-medium mb-2 block">Services Offered</label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a service..."
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addService()}
                />
                <Button type="button" onClick={addService} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {services.map((service, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {service}
                    <button onClick={() => removeService(index)}>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Destinations Covered</label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a destination..."
                  value={newDestination}
                  onChange={(e) => setNewDestination(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addDestination()}
                />
                <Button type="button" onClick={addDestination} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {destinations.map((destination, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {destination}
                    <button onClick={() => removeDestination(index)}>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
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