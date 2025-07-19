
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, X, ExternalLink, Link, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BusinessDocumentUploadProps {
  label: string;
  currentUrl?: string;
  onUrlChange: (url: string | null) => void;
  disabled?: boolean;
}

export const BusinessDocumentUpload: React.FC<BusinessDocumentUploadProps> = ({
  label,
  currentUrl,
  onUrlChange,
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Selected file:', file.name, 'Type:', file.type, 'Size:', file.size);

    // Validate file type - Only PDFs
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed for business documents');
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

      // Create unique file path with operator ID
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `business-docs/${user.id}/${timestamp}-${sanitizedFileName}`;

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

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(urlInput);
      onUrlChange(urlInput.trim());
      toast.success('Document URL saved successfully');
      setUrlInput('');
    } catch {
      toast.error('Please enter a valid URL');
    }
  };

  const handleRemoveDocument = () => {
    setFileName('');
    setUrlInput('');
    onUrlChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Document removed');
  };

  const getFileNameFromUrl = (url: string) => {
    if (url.includes('supabase')) {
      // Extract filename from Supabase URL
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      // Remove timestamp prefix if present
      return lastPart.replace(/^\d+-/, '') || 'Business Document';
    }
    return 'External Document';
  };

  const isUploadedFile = currentUrl && currentUrl.includes('supabase');
  const displayFileName = fileName || (currentUrl ? getFileNameFromUrl(currentUrl) : '');

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">{label}</Label>
      
      {currentUrl || fileName ? (
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">
                {displayFileName}
              </span>
              <p className="text-xs text-green-600 font-medium">
                {isUploadedFile ? 'PDF Uploaded Successfully' : 'External Document Link'}
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload PDF</TabsTrigger>
            <TabsTrigger value="url">Add URL</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div 
              className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors bg-blue-50"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-10 h-10 text-blue-500 mx-auto mb-3" />
              <p className="text-base font-medium text-gray-700 mb-2">
                Upload Business Document (PDF)
              </p>
              <p className="text-sm text-gray-500 mb-1">
                Click to select your business verification PDF
              </p>
              <p className="text-xs text-gray-400">
                Maximum file size: 5MB
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
          </TabsContent>
          
          <TabsContent value="url" className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="url-input" className="text-sm font-medium">Document URL</Label>
              <Input
                id="url-input"
                type="url"
                placeholder="https://example.com/your-business-document.pdf"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                disabled={disabled}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Enter a direct link to your business verification document
              </p>
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleUrlSubmit}
              disabled={disabled || !urlInput.trim()}
              className="w-full"
            >
              <Link className="w-4 h-4 mr-2" />
              Save Document URL
            </Button>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
