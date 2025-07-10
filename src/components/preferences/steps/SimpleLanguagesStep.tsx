
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface SimpleLanguagesStepProps {
  value: string[];
  onChange: (languages: string[]) => void;
}

const commonLanguages = [
  'English',
  'French',
  'German',
  'Spanish',
  'Italian',
  'Portuguese',
  'Swahili',
  'Arabic',
  'Mandarin',
  'Japanese',
  'Russian',
  'Dutch',
  'Other'
];

export const SimpleLanguagesStep: React.FC<SimpleLanguagesStepProps> = ({ value, onChange }) => {
  const toggleLanguage = (language: string) => {
    if (value.includes(language)) {
      onChange(value.filter(lang => lang !== language));
    } else {
      onChange([...value, language]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {commonLanguages.map((language) => (
          <Card
            key={language}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              value.includes(language)
                ? 'ring-2 ring-primary bg-primary/5'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => toggleLanguage(language)}
          >
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{language}</span>
                {value.includes(language) && (
                  <Check className="w-3 h-3 text-primary" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {value.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium mb-2 text-sm">Selected Languages:</h4>
          <div className="flex flex-wrap gap-1">
            {value.map((language) => (
              <Badge key={language} variant="secondary" className="text-xs">
                {language}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
