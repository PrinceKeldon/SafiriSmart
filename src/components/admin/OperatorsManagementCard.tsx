
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateOperatorDialog } from '@/components/admin/CreateOperatorDialog';
import { ComprehensiveOperatorCard } from '@/components/admin/ComprehensiveOperatorCard';
import { Tables } from '@/integrations/supabase/types';

type Operator = Tables<'operators'>;

interface OperatorWithDocuments extends Operator {
  documents?: {
    certificate_of_incorporation?: { url: string; valid: boolean; type: string };
    business_permit?: { url: string; valid: boolean; type: string };
    kato_membership?: { url: string; valid: boolean; type: string };
  };
}

interface OperatorsManagementCardProps {
  operators: OperatorWithDocuments[];
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

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Operator Management</CardTitle>
            <CardDescription>
              Manage tour operators, review proof of trust documents, and approve registrations
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
          <div className="grid gap-6">
            {operators.map((operator) => (
              <ComprehensiveOperatorCard
                key={operator.id}
                operator={operator}
                onUpdateOperator={onUpdateOperator}
                onDeleteOperator={onDeleteOperator}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
