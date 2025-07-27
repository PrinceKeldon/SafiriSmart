
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Plus } from 'lucide-react';

export const EmptyPackageState: React.FC = () => {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
        <div className="text-gray-500 space-y-2">
          <h3 className="text-lg font-medium">No Kenya safari packages created yet</h3>
          <p className="text-sm max-w-md break-words">
            Create your first Kenya safari tour package to start managing your pricing and showcase your Kenya safari offerings to potential customers.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
