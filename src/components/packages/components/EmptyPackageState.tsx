import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const EmptyPackageState: React.FC = () => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="text-gray-500 text-center">
          <h3 className="text-lg font-medium mb-2">No packages created yet</h3>
          <p>Create your first tour package to start managing your pricing</p>
        </div>
      </CardContent>
    </Card>
  );
};