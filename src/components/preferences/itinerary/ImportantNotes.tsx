
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface ImportantNotesProps {
  notes: string[];
}

export const ImportantNotes: React.FC<ImportantNotesProps> = ({ notes }) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg flex items-center text-orange-700">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Important Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {notes.map((note, index) => (
            <li key={index} className="flex items-start text-gray-700">
              <AlertTriangle className="w-4 h-4 mr-2 text-orange-500 mt-0.5 flex-shrink-0" />
              {note}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
