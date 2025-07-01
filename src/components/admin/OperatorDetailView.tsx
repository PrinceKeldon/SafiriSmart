
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Building, Mail, Phone, MapPin, FileText } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Operator = Tables<'operators'>;

interface OperatorDetailViewProps {
  operator: Operator | null;
}

export const OperatorDetailView = ({ operator }: OperatorDetailViewProps) => {
  if (!operator) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Operator Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Select an operator to view details</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Operator Details</span>
          </div>
          <Badge variant={operator.is_active ? "default" : "secondary"}>
            {operator.is_active ? "Active" : "Inactive"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-start space-x-3">
            <User className="h-4 w-4 mt-1 text-gray-500" />
            <div>
              <p className="font-medium">{operator.name}</p>
              <p className="text-sm text-gray-500">Name</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Mail className="h-4 w-4 mt-1 text-gray-500" />
            <div>
              <p className="font-medium">{operator.email}</p>
              <p className="text-sm text-gray-500">Email</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Building className="h-4 w-4 mt-1 text-gray-500" />
            <div>
              <p className="font-medium">{operator.company}</p>
              <p className="text-sm text-gray-500">Company</p>
            </div>
          </div>

          {operator.contact_person_phone && (
            <div className="flex items-start space-x-3">
              <Phone className="h-4 w-4 mt-1 text-gray-500" />
              <div>
                <p className="font-medium">{operator.contact_person_phone}</p>
                <p className="text-sm text-gray-500">Phone</p>
              </div>
            </div>
          )}

          {operator.city && (
            <div className="flex items-start space-x-3">
              <MapPin className="h-4 w-4 mt-1 text-gray-500" />
              <div>
                <p className="font-medium">{operator.city}, {operator.country}</p>
                <p className="text-sm text-gray-500">Location</p>
              </div>
            </div>
          )}

          {operator.specializations && operator.specializations.length > 0 && (
            <div className="flex items-start space-x-3">
              <FileText className="h-4 w-4 mt-1 text-gray-500" />
              <div>
                <div className="flex flex-wrap gap-1">
                  {operator.specializations.map((spec, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">Specializations</p>
              </div>
            </div>
          )}

          {operator.description && (
            <div className="flex items-start space-x-3">
              <FileText className="h-4 w-4 mt-1 text-gray-500" />
              <div>
                <p className="font-medium">{operator.description}</p>
                <p className="text-sm text-gray-500">Description</p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          <div className="text-xs text-gray-500">
            <p>Created: {new Date(operator.created_at || '').toLocaleDateString()}</p>
            <p>Updated: {new Date(operator.updated_at || '').toLocaleDateString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
