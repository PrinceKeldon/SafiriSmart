
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, File, X, ExternalLink, Link, Image, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EnhancedFileUploadFieldProps {
  label: string;
  currentUrl?: string;
  onUrlChange: (url: string | null) => void;
  disabled?: boolean;
}

export const EnhancedFileUploadField: React.FC<EnhancedFileUploadFieldProps> = ({
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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Selected file:', file.name, 'Type:', file.type, 'Size:', file.size);

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const fileName = `${timestamp}-${randomId}.${fileExt}`;
      const filePath = `verification-docs/${fileName}`;

      console.log('Uploading to path:', filePath);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

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
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
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
      toast.success('URL saved successfully');
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
  };

  const getFileNameFromUrl = (url: string) => {
    if (url.includes('supabase')) {
      // Extract filename from Supabase URL
      const parts = url.split('/');
      return parts[parts.length - 1] || 'Uploaded Document';
    }
    return 'External Document';
  };

  const getFileIcon = (url?: string) => {
    if (!url) return FileText;
    
    if (url.toLowerCase().includes('.pdf') || url.includes('pdf')) return FileText;
    if (url.match(/\.(jpg|jpeg|png|gif|webp)/i)) return Image;
    if (url.startsWith('http')) return Link;
    return FileText;
  };

  const FileIcon = getFileIcon(currentUrl);

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">{label}</Label>
      
      {currentUrl || fileName ? (
        <div className="flex items-center justify-between p-4 bg-gray-50 border rounded-lg">
          <div className="flex items-center space-x-3">
            <FileIcon className="w-5 h-5 text-gray-500" />
            <div>
              <span className="text-sm font-medium text-gray-700">
                {fileName || getFileNameFromUrl(currentUrl!)}
              </span>
              <p className="text-xs text-gray-500">
                {currentUrl?.startsWith('http') ? 'External Link' : 'Uploaded File'}
              </p>
            </div>
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
              onClick={handleRemoveDocument}
              disabled={disabled}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="url">Add URL</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Click to upload your verification document
              </p>
              <p className="text-xs text-gray-500">
                PDF or Images (JPEG, PNG, GIF, WebP) up to 10MB
              </p>
            </div>
            
            <Input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
              onChange={handleFileSelect}
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
              {uploading ? 'Uploading...' : 'Choose File'}
            </Button>
          </TabsContent>
          
          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url-input" className="text-sm">Document URL</Label>
              <Input
                id="url-input"
                type="url"
                placeholder="https://example.com/your-document.pdf"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                disabled={disabled}
              />
              <p className="text-xs text-gray-500">
                Enter a direct link to your verification document
              </p>
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleUrlSubmit}
              disabled={disabled || !urlInput.trim()}
              className="w-full"
            >
              Save URL
            </Button>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
