
import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Trash2 } from 'lucide-react';
import { OperatorDetailView } from './OperatorDetailView';
import { OperatorProfileProgress } from './OperatorProfileProgress';
import { adminService } from '@/services/AdminService';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

type Operator = Tables<'operators'>;

interface OperatorsListProps {
  operators: Operator[];
  onSelectOperator: (operator: Operator) => void;
  onUpdateOperator: (updatedOperator: Operator) => void;
  onDeleteOperator: (operatorId: string) => void;
}

export const OperatorsList: React.FC<OperatorsListProps> = ({ 
  operators, 
  onSelectOperator,
  onUpdateOperator,
  onDeleteOperator
}) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const handleToggleStatus = async (operator: Operator) => {
    setLoadingStates(prev => ({ ...prev, [operator.id]: true }));
    
    try {
      const response = await adminService.toggleOperatorStatus(operator.id, !operator.is_active);
      if (response.success) {
        onUpdateOperator(response.data);
        toast.success(`Operator ${!operator.is_active ? 'activated' : 'deactivated'} successfully`);
      } else {
        toast.error(response.errors?.[0] || 'Failed to update operator status');
      }
    } catch (error) {
      console.error('Error toggling operator status:', error);
      toast.error('Failed to update operator status');
    } finally {
      setLoadingStates(prev => ({ ...prev, [operator.id]: false }));
    }
  };

  const handleDeleteOperator = async (operator: Operator) => {
    if (!window.confirm(`Are you sure you want to delete ${operator.name}? This action cannot be undone.`)) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, [operator.id]: true }));
    
    try {
      const response = await adminService.deleteOperator(operator.id);
      if (response.success) {
        onDeleteOperator(operator.id);
        toast.success('Operator deleted successfully');
      } else {
        toast.error(response.errors?.[0] || 'Failed to delete operator');
      }
    } catch (error) {
      console.error('Error deleting operator:', error);
      toast.error('Failed to delete operator');
    } finally {
      setLoadingStates(prev => ({ ...prev, [operator.id]: false }));
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {operators.map((operator) => (
        <div key={operator.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1 cursor-pointer" onClick={() => onSelectOperator(operator)}>
            <div className="flex items-center space-x-2">
              <h3 className="font-medium">{operator.name}</h3>
              <Badge variant={operator.is_active ? "default" : "secondary"}>
                {operator.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{operator.email}</p>
            <p className="text-sm text-gray-500">{operator.company}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {operator.specializations?.map((spec, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {spec}
                </Badge>
              ))}
            </div>
            
            {/* Profile Progress */}
            <div className="mt-3 p-2 bg-gray-50 rounded-md">
              <OperatorProfileProgress operator={operator} compact />
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Joined: {formatDate(operator.created_at)}</p>
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
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleToggleStatus(operator)}
                disabled={loadingStates[operator.id]}
              >
                {loadingStates[operator.id] 
                  ? 'Updating...' 
                  : operator.is_active ? "Deactivate" : "Activate"
                }
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDeleteOperator(operator)}
                disabled={loadingStates[operator.id]}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
