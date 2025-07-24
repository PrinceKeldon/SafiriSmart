
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, AlertCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DescriptionGeneratorProps {
  value: string;
  onChange: (value: string) => void;
  packageName?: string;
}

export const DescriptionGenerator: React.FC<DescriptionGeneratorProps> = ({
  value,
  onChange,
  packageName
}) => {
  const [keywords, setKeywords] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!packageName?.trim()) {
      return;
    }

    setIsLoading(true);
    
    // Simulate loading for coming soon feature
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter a detailed description of your safari package..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          className="mt-1"
        />
      </div>

      <div className="space-y-3 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-medium text-gray-700">AI Description Generator</span>
          <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
            <Clock className="h-3 w-3" />
            Coming Soon
          </div>
        </div>

        <div>
          <Input
            placeholder="Optional: Add keywords or phrases to inspire the AI description"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            disabled={true}
            className="bg-white"
          />
        </div>

        <Button
          type="button"
          onClick={handleGenerate}
          disabled={true}
          className="w-full bg-gray-300 text-gray-500 cursor-not-allowed"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Description (Coming Soon)
        </Button>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            AI-generated content feature is coming soon! For now, please write your description manually.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};
