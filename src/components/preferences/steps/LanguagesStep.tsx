
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Languages } from 'lucide-react';

interface LanguagesStepProps {
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

export const LanguagesStep: React.FC<LanguagesStepProps> = ({ value, onChange }) => {
  const toggleLanguage = (language: string) => {
    if (value.includes(language)) {
      onChange(value.filter(lang => lang !== language));
    } else {
      onChange([...value, language]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Languages className="w-12 h-12 text-primary mx-auto mb-3" />
        <h3 className="text-lg font-semibold">Preferred Languages</h3>
        <p className="text-gray-600">Select the languages you'd like your guide to speak</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-between">
                <span className="font-medium">{language}</span>
                {value.includes(language) && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {value.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium mb-3">Selected Languages:</h4>
          <div className="flex flex-wrap gap-2">
            {value.map((language) => (
              <Badge key={language} variant="secondary" className="px-3 py-1">
                {language}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
