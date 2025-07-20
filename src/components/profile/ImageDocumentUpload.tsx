
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Image, X, ExternalLink, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImageDocumentUploadProps {
  label: string;
  currentUrl?: string;
  onUrlChange: (url: string | null) => void;
  disabled?: boolean;
  storagePath?: string;
}

export const ImageDocumentUpload: React.FC<ImageDocumentUploadProps> = ({
  label,
  currentUrl,
  onUrlChange,
  disabled = false,
  storagePath = 'proof-of-trust/images'
}) => {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValidImageUrl = (url: string) => {
    // Check if it's a valid image URL
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];
    const hasImageExtension = imageExtensions.some(ext => url.toLowerCase().includes(ext));
    const isFromImageStorage = url.includes('supabase') && url.includes('image-uploads');
    return hasImageExtension || isFromImageStorage;
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Selected file:', file.name, 'Type:', file.type, 'Size:', file.size);

    // Validate file type - Accept all standard image formats
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/tiff'
    ];
    
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      toast.error('Only image files are allowed (JPG, PNG, GIF, WebP, BMP, TIFF)');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Additional validation to reject PDFs and documents
    if (file.type === 'application/pdf' || fileExtension === '.pdf') {
      toast.error('PDF files should be uploaded in the PDF section');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      const filePath = `${user.id}/${timestamp}-${sanitizedFileName}`;

      console.log('Uploading image to bucket: image-uploads, path:', filePath);

      // Upload file to Supabase Storage - using new image-uploads bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('image-uploads')
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
        .from('image-uploads')
        .getPublicUrl(uploadData.path);

      console.log('Generated public URL:', publicUrl);

      setFileName(file.name);
      onUrlChange(publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      toast.error(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveDocument = () => {
    setFileName('');
    onUrlChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Image document removed');
  };

  const getFileNameFromUrl = (url: string) => {
    if (url.includes('supabase')) {
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      return lastPart.replace(/^\d+-/, '') || 'Image Document';
    }
    return 'Image Document';
  };

  const displayFileName = fileName || (currentUrl ? getFileNameFromUrl(currentUrl) : '');

  // Check if current URL is actually a valid image
  const isCurrentUrlValid = currentUrl && isValidImageUrl(currentUrl);

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">{label}</Label>
      
      {isCurrentUrlValid ? (
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <Image className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <span className="text-sm font-medium text-green-700">
                {displayFileName}
              </span>
              <p className="text-xs text-green-600 font-medium">
                Image Uploaded Successfully
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.open(currentUrl, '_blank')}
              className="text-green-600 hover:text-green-800"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              View Image
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
      ) : currentUrl ? (
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <X className="w-5 h-5 text-red-600" />
            <div>
              <span className="text-sm font-medium text-red-700">
                Invalid Image Entry
              </span>
              <p className="text-xs text-red-600">
                This entry is not a valid image file. Please remove and upload an image.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveDocument}
            disabled={disabled}
            className="text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
            Remove
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div 
            className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-400 transition-colors bg-green-50"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <p className="text-base font-medium text-gray-700 mb-2">
              Upload Image Document
            </p>
            <p className="text-sm text-gray-500 mb-1">
              Click to select your image file
            </p>
            <p className="text-xs text-gray-400">
              Maximum file size: 5MB | JPG, PNG, GIF, WebP, BMP, TIFF formats
            </p>
          </div>
          
          <Input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff,image/*"
            onChange={handleImageUpload}
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
            {uploading ? 'Uploading Image...' : 'Choose Image File'}
          </Button>
        </div>
      )}
    </div>
  );
};
