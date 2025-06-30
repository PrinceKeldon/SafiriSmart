
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';

interface InclusionsExclusionsProps {
  inclusions: string[];
  exclusions: string[];
}

export const InclusionsExclusions: React.FC<InclusionsExclusionsProps> = ({
  inclusions,
  exclusions
}) => {
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center text-green-700">
            <CheckCircle className="w-5 h-5 mr-2" />
            What's Included
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {inclusions.map((inclusion, index) => (
              <li key={index} className="flex items-center text-gray-700">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                {inclusion}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center text-red-700">
            <XCircle className="w-5 h-5 mr-2" />
            What's Not Included
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {exclusions.map((exclusion, index) => (
              <li key={index} className="flex items-center text-gray-700">
                <XCircle className="w-4 h-4 mr-2 text-red-500" />
                {exclusion}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
