
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, File, X, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FileUploadFieldProps {
  label: string;
  currentUrl?: string;
  onUrlChange: (url: string | null) => void;
  accept?: string;
  disabled?: boolean;
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
  label,
  currentUrl,
  onUrlChange,
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('operator-documents')
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('operator-documents')
        .getPublicUrl(data.path);

      setFileName(file.name);
      onUrlChange(publicUrl);
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFileName('');
    onUrlChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileNameFromUrl = (url: string) => {
    return url.split('/').pop() || 'Document';
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {currentUrl || fileName ? (
        <div className="flex items-center justify-between p-3 bg-gray-50 border rounded-md">
          <div className="flex items-center space-x-2">
            <File className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">
              {fileName || getFileNameFromUrl(currentUrl!)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {currentUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => window.open(currentUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              disabled={disabled}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            PDF, DOC, DOCX, JPG, PNG up to 10MB
          </p>
        </div>
      )}
      
      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        disabled={disabled || uploading}
        className="hidden"
      />
      
      {!currentUrl && !fileName && (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="w-full"
        >
          {uploading ? 'Uploading...' : 'Choose File'}
        </Button>
      )}
    </div>
  );
};
