
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  const [keywords, setKeywords] = useState('');

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
          context: keywords.trim() || 'safari tour package in Kenya',
          userKeywords: keywords.trim()
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Package Description
        </label>
      </div>
      
      {/* Keywords/Context Input */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600">
          AI Keywords & Context (Optional)
        </label>
        <div className="flex gap-2">
          <Input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Optional: Add keywords or phrases to inspire the AI description"
            className="flex-1 text-sm"
            maxLength={200}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateDescription}
            disabled={isGenerating || !packageName.trim()}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Description'}
          </Button>
        </div>
      </div>
      
      {/* Main Description Textarea */}
      <Textarea
        value={generatedDescription}
        onChange={(e) => handleDescriptionChange(e.target.value)}
        placeholder="Enter package description or use the generate button above..."
        className="min-h-[120px]"
        rows={5}
      />
      
      {/* User Notice */}
      <div className="flex flex-col space-y-1">
        <p className="text-xs text-gray-500">
          💡 <strong>Tip:</strong> Use the generate button to create an AI-powered description based on your package name and keywords.
        </p>
        <p className="text-xs text-amber-600">
          ⚠️ <strong>Note:</strong> AI-generated content may occasionally include errors. Please review and adjust before publishing.
        </p>
      </div>
    </div>
  );
};
