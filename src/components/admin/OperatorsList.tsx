
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye } from 'lucide-react';
import { OperatorDetailView } from './OperatorDetailView';

interface Operator {
  id: string;
  name: string;
  email: string;
  company: string;
  company_name?: string;
  registration_number?: string;
  address?: string;
  city?: string;
  country?: string;
  contact_person_name?: string;
  contact_person_phone?: string;
  website_url?: string;
  description?: string;
  certificate_of_incorporation_url?: string;
  business_permit_url?: string;
  kato_membership_url?: string;
  role: string;
  specializations: string[];
  is_active: boolean;
  created_at: string;
}

interface OperatorsListProps {
  operators: Operator[];
  onUpdateOperator: (updatedOperator: Operator) => void;
}

export const OperatorsList: React.FC<OperatorsListProps> = ({ 
  operators, 
  onUpdateOperator 
}) => {
  return (
    <div className="space-y-4">
      {operators.map((operator) => (
        <div key={operator.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium">{operator.name}</h3>
              <Badge variant={operator.is_active ? "default" : "secondary"}>
                {operator.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{operator.email}</p>
            <p className="text-sm text-gray-500">{operator.company}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {operator.specializations.map((spec, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {spec}
                </Badge>
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Joined: {operator.created_at}</p>
            <div className="flex space-x-2 mt-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Operator Details</DialogTitle>
                    <DialogDescription>
                      View and edit operator profile information
                    </DialogDescription>
                  </DialogHeader>
                  <OperatorDetailView 
                    operator={operator} 
                    onUpdate={onUpdateOperator}
                  />
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm">
                {operator.is_active ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
