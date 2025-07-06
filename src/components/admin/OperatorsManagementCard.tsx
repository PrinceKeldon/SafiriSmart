
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateOperatorDialog } from '@/components/admin/CreateOperatorDialog';
import { OperatorsList } from '@/components/admin/OperatorsList';
import { Tables } from '@/integrations/supabase/types';

type Operator = Tables<'operators'>;

interface OperatorsManagementCardProps {
  operators: Operator[];
  loading: boolean;
  onCreateOperator: (operatorData: any) => Promise<void>;
  onUpdateOperator: (updatedOperator: Operator) => void;
  onDeleteOperator: (operatorId: string) => void;
}

export const OperatorsManagementCard: React.FC<OperatorsManagementCardProps> = ({
  operators,
  loading,
  onCreateOperator,
  onUpdateOperator,
  onDeleteOperator
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleSelectOperator = (operator: Operator) => {
    // Handle operator selection - could be used for detailed view
    console.log('Selected operator:', operator);
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Operator Management</CardTitle>
            <CardDescription>
              Manage tour operators, approve registrations, and view operator details
            </CardDescription>
          </div>
          <CreateOperatorDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            onCreateOperator={onCreateOperator}
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-sm text-gray-500">Loading operators...</div>
          </div>
        ) : operators.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No operators found</p>
          </div>
        ) : (
          <OperatorsList
            operators={operators}
            onSelectOperator={handleSelectOperator}
            onUpdateOperator={onUpdateOperator}
            onDeleteOperator={onDeleteOperator}
          />
        )}
      </CardContent>
    </Card>
  );
};
