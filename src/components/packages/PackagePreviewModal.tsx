import React from 'react';
import { Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { OperatorPackage } from '@/types/operator';
import { useOperatorProfile } from '@/hooks/useOperatorProfile';
import { PackagePreviewContent } from './components/PackagePreviewContent';
import { generatePackageImage } from './utils/packageImageGenerator';
import { toast } from 'sonner';

interface PackagePreviewModalProps {
  package: OperatorPackage | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PackagePreviewModal: React.FC<PackagePreviewModalProps> = ({
  package: pkg,
  isOpen,
  onClose,
}) => {
  const { data: operatorProfile } = useOperatorProfile();

  const handleDownload = async () => {
    if (!pkg) return;
    
    try {
      const canvas = await generatePackageImage(pkg, operatorProfile);
      if (!canvas) return;

      canvas.toBlob((blob) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${pkg.package_name.replace(/\s+/g, '_')}_package.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success('Package image downloaded successfully');
      }, 'image/png');
    } catch (error) {
      toast.error('Failed to generate package image');
    }
  };

  const handleShare = async () => {
    if (!pkg) return;
    
    const companyName = operatorProfile?.company_name || operatorProfile?.company || '';
    const shareText = `${companyName ? `${companyName}\n` : ''}${pkg.package_name}\n\n${pkg.description}\n\nDuration: ${pkg.min_duration}-${pkg.max_duration} days\nGroup Size: ${pkg.min_group_size}-${pkg.max_group_size} people\nBudget: ${pkg.budget_tier}\nCost: $${pkg.estimated_cost_per_person_per_day}/person/day`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: pkg.package_name,
          text: shareText,
        });
        toast.success('Package shared successfully');
      } catch (error) {
        // User cancelled sharing or error occurred
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success('Package details copied to clipboard');
      } catch (error) {
        toast.error('Failed to copy package details');
      }
    }
  };

  if (!pkg) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              {(operatorProfile?.company_name || operatorProfile?.company) && (
                <p className="text-sm text-gray-600 font-normal mb-1">
                  {operatorProfile.company_name || operatorProfile.company}
                </p>
              )}
              <span>{pkg.package_name}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <PackagePreviewContent pkg={pkg} operatorProfile={operatorProfile} />
      </DialogContent>
    </Dialog>
  );
};
