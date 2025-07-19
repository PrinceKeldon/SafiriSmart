
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, X, ExternalLink, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PdfDocumentUploadProps {
  label: string;
  currentUrl?: string;
  onUrlChange: (url: string | null) => void;
  disabled?: boolean;
  storagePath?: string;
}

export const PdfDocumentUpload: React.FC<PdfDocumentUploadProps> = ({
  label,
  currentUrl,
  onUrlChange,
  disabled = false,
  storagePath = 'proof-of-trust/pdfs'
}) => {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Selected PDF file:', file.name, 'Type:', file.type, 'Size:', file.size);

    // Validate file type - Only PDFs
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Create unique file path
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${storagePath}/${user.id}/${timestamp}-${sanitizedFileName}`;

      console.log('Uploading PDF to path:', filePath);

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('operator-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        if (uploadError.message.includes('already exists')) {
          throw new Error('A file with this name already exists. Please try again.');
        }
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('operator-documents')
        .getPublicUrl(uploadData.path);

      console.log('Generated public URL:', publicUrl);

      setFileName(file.name);
      onUrlChange(publicUrl);
      toast.success('PDF uploaded successfully');
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload PDF';
      toast.error(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveDocument = () => {
    setFileName('');
    onUrlChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('PDF document removed');
  };

  const getFileNameFromUrl = (url: string) => {
    if (url.includes('supabase')) {
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      return lastPart.replace(/^\d+-/, '') || 'PDF Document';
    }
    return 'PDF Document';
  };

  const displayFileName = fileName || (currentUrl ? getFileNameFromUrl(currentUrl) : '');

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">{label}</Label>
      
      {currentUrl || fileName ? (
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <span className="text-sm font-medium text-blue-700">
                {displayFileName}
              </span>
              <p className="text-xs text-blue-600 font-medium">
                PDF Uploaded Successfully
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.open(currentUrl, '_blank')}
              className="text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveDocument}
              disabled={disabled}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div 
            className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors bg-blue-50"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-10 h-10 text-blue-500 mx-auto mb-3" />
            <p className="text-base font-medium text-gray-700 mb-2">
              Upload PDF Document
            </p>
            <p className="text-sm text-gray-500 mb-1">
              Click to select your PDF file
            </p>
            <p className="text-xs text-gray-400">
              Maximum file size: 5MB | PDF format only
            </p>
          </div>
          
          <Input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handlePdfUpload}
            disabled={disabled || uploading}
            className="hidden"
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="w-full"
          >
            {uploading ? 'Uploading PDF...' : 'Choose PDF File'}
          </Button>
        </div>
      )}
    </div>
  );
};
