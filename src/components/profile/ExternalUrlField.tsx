
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, X, ExternalLink, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ExternalUrlFieldProps {
  label: string;
  currentUrl?: string;
  onUrlChange: (url: string | null) => void;
  disabled?: boolean;
}

export const ExternalUrlField: React.FC<ExternalUrlFieldProps> = ({
  label,
  currentUrl,
  onUrlChange,
  disabled = false
}) => {
  const [urlInput, setUrlInput] = useState<string>(currentUrl || '');

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(urlInput);
      onUrlChange(urlInput.trim());
      toast.success('External URL saved successfully');
    } catch {
      toast.error('Please enter a valid URL');
    }
  };

  const handleRemoveUrl = () => {
    setUrlInput('');
    onUrlChange(null);
    toast.success('External URL removed');
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">{label}</Label>
      
      {currentUrl ? (
        <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              <Link className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <span className="text-sm font-medium text-purple-700 truncate max-w-xs">
                {currentUrl}
              </span>
              <p className="text-xs text-purple-600 font-medium">
                External URL Saved
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.open(currentUrl, '_blank')}
              className="text-purple-600 hover:text-purple-800"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Visit
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveUrl}
              disabled={disabled}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-6 border-2 border-dashed border-purple-300 rounded-lg bg-purple-50">
            <div className="text-center">
              <Link className="w-10 h-10 text-purple-500 mx-auto mb-3" />
              <p className="text-base font-medium text-gray-700 mb-2">
                External Verification URL
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Provide a link to external verification (website, directory, etc.)
              </p>
            </div>
            
            <div className="space-y-3">
              <Input
                type="url"
                placeholder="https://example.com/your-verification-page"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                disabled={disabled}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Enter a direct link to publicly verifiable information about your business
              </p>
            </div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleUrlSubmit}
            disabled={disabled || !urlInput.trim()}
            className="w-full"
          >
            <Link className="w-4 h-4 mr-2" />
            Save External URL
          </Button>
        </div>
      )}
    </div>
  );
};
