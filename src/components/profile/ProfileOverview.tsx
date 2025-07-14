import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Globe, Phone } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type OperatorRow = Tables<'operators'>;

interface ProfileOverviewProps {
  profile: OperatorRow | undefined;
}

export const ProfileOverview: React.FC<ProfileOverviewProps> = ({ profile }) => {
  if (!profile) return null;

  const getCompletionPercentage = () => {
    const fields = [
      profile.company_name,
      profile.registration_number,
      profile.address,
      profile.city,
      profile.contact_person_name,
      profile.contact_person_phone,
      profile.description,
      profile.certificate_of_incorporation_url,
      profile.business_permit_url,
      profile.kato_membership_url
    ];
    
    const filledFields = fields.filter(field => field && field.length > 0).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const completionPercentage = getCompletionPercentage();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            {profile.company_name || profile.company || 'Company Profile'}
          </CardTitle>
          <Badge variant={completionPercentage >= 80 ? 'default' : 'secondary'}>
            {completionPercentage}% Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile.description && (
          <p className="text-muted-foreground">{profile.description}</p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.city && profile.country && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{profile.city}, {profile.country}</span>
            </div>
          )}
          
          {profile.website_url && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <a 
                href={profile.website_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {profile.website_url}
              </a>
            </div>
          )}
          
          {profile.contact_person_phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{profile.contact_person_phone}</span>
            </div>
          )}
        </div>

        {((Array.isArray(profile.services_offered) && profile.services_offered.length > 0) || 
          (Array.isArray(profile.destinations_covered) && profile.destinations_covered.length > 0)) && (
          <div className="space-y-2">
            {Array.isArray(profile.services_offered) && profile.services_offered.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-1">Services</h4>
                <div className="flex flex-wrap gap-1">
                  {(profile.services_offered as string[]).map((service, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {Array.isArray(profile.destinations_covered) && profile.destinations_covered.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-1">Destinations</h4>
                <div className="flex flex-wrap gap-1">
                  {(profile.destinations_covered as string[]).map((destination, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {destination}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};