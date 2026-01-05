import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CompletedLead } from '@/types/lead';
import { CheckCircle2, Mail, Phone, MapPin, Calendar, Users, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface CompletedLeadsGridProps {
  completedLeads: CompletedLead[];
}

export const CompletedLeadsGrid: React.FC<CompletedLeadsGridProps> = ({ completedLeads }) => {
  if (completedLeads.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No completed leads yet</h3>
          <p className="text-muted-foreground text-center">
            Complete all checklist items on a lead to see it here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {completedLeads.map((lead) => (
        <Card key={lead.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  {lead.traveler_name}
                </CardTitle>
                <CardDescription className="mt-1">
                  Converted on {format(new Date(lead.completed_at), 'MMM dd, yyyy')}
                </CardDescription>
              </div>
              <Badge variant="default" className="bg-green-600">
                Converted
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Contact Info */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground">Contact Info</h4>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{lead.traveler_email}</span>
                </div>
                {lead.traveler_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.traveler_phone}</span>
                  </div>
                )}
                {lead.traveler_country && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.traveler_country}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Trip Details */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground">Trip Summary</h4>
              <div className="space-y-1.5">
                {lead.group_size && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.group_size} travelers</span>
                  </div>
                )}
                {lead.itinerary_summary?.total_days && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.itinerary_summary.total_days} days</span>
                  </div>
                )}
                {lead.quoted_price && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {lead.quoted_currency || 'USD'} {lead.quoted_price.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Destinations */}
            {lead.destinations && lead.destinations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground">Destinations</h4>
                <div className="flex flex-wrap gap-1.5">
                  {lead.destinations.slice(0, 4).map((dest, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {dest}
                    </Badge>
                  ))}
                  {lead.destinations.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{lead.destinations.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Itinerary Title */}
            {lead.itinerary_summary?.title && (
              <div className="pt-2 border-t">
                <p className="text-sm font-medium text-primary truncate">
                  {lead.itinerary_summary.title}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
