
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DescriptionGeneratorProps {
  packageName: string;
  currentDescription: string;
  onDescriptionGenerated: (description: string) => void;
}

export const DescriptionGenerator: React.FC<DescriptionGeneratorProps> = ({
  packageName,
  currentDescription,
  onDescriptionGenerated,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState(currentDescription);

  const generateDescription = async () => {
    if (!packageName.trim()) {
      toast.error('Please enter a package name first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageName,
          context: 'safari tour package in Kenya'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate description');
      }

      const data = await response.json();
      const description = data.description;
      
      setGeneratedDescription(description);
      onDescriptionGenerated(description);
      
      toast.success('Description generated successfully!');
    } catch (error) {
      console.error('Error generating description:', error);
      toast.error('Failed to generate description. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDescriptionChange = (value: string) => {
    setGeneratedDescription(value);
    onDescriptionGenerated(value);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Package Description
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={generateDescription}
          disabled={isGenerating || !packageName.trim()}
          className="flex items-center gap-2"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Wand2 className="w-4 h-4" />
          )}
          {isGenerating ? 'Generating...' : 'Generate Description'}
        </Button>
      </div>
      
      <Textarea
        value={generatedDescription}
        onChange={(e) => handleDescriptionChange(e.target.value)}
        placeholder="Enter package description or use the generate button..."
        className="min-h-[100px]"
        rows={4}
      />
      
      <p className="text-xs text-gray-500">
        Tip: Use the generate button to create an AI-powered description based on your package name.
      </p>
    </div>
  );
};
