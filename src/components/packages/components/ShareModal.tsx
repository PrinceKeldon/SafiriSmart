
import React from 'react';
import { Share2, Facebook, Twitter, Linkedin, Mail, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { OperatorPackage } from '@/types/operator';
import { toast } from 'sonner';

interface ShareModalProps {
  package: OperatorPackage | null;
  operatorProfile?: any;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  package: pkg,
  operatorProfile,
  isOpen,
  onClose,
}) => {
  if (!pkg) return null;

  const generateShareText = () => {
    const companyName = operatorProfile?.company_name || operatorProfile?.company || '';
    const contactPerson = pkg.contact_person ? `Contact: ${pkg.contact_person}\n` : '';
    const email = operatorProfile?.email ? `Email: ${operatorProfile.email}\n` : '';
    const website = operatorProfile?.website_url ? `Website: ${operatorProfile.website_url}\n` : '';
    
    return `${companyName ? `${companyName}\n` : ''}${pkg.package_name}\n\n${pkg.description}\n\nDuration: ${pkg.min_duration}-${pkg.max_duration} days\nGroup Size: ${pkg.min_group_size}-${pkg.max_group_size} people\nBudget: ${pkg.budget_tier}\nCost: $${pkg.estimated_cost_per_person_per_day}/person/day\n\n${contactPerson}${email}${website}`;
  };

  const shareText = generateShareText();
  const encodedText = encodeURIComponent(shareText);
  const encodedTitle = encodeURIComponent(pkg.package_name);
  const currentUrl = encodeURIComponent(window.location.href);

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}&quote=${encodedText}`,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${currentUrl}`,
      color: 'bg-sky-500 hover:bg-sky-600'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}&title=${encodedTitle}&summary=${encodedText}`,
      color: 'bg-blue-700 hover:bg-blue-800'
    },
    {
      name: 'Email',
      icon: Mail,
      url: `mailto:?subject=${encodedTitle}&body=${encodedText}`,
      color: 'bg-gray-600 hover:bg-gray-700'
    }
  ];

  const handlePlatformShare = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success('Package details copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy package details');
    }
  };

  const handleNativeShare = async () => {
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
      handleCopyToClipboard();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Package
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-sm text-gray-700 mb-2">Package Preview</h3>
            <p className="text-sm font-medium">{pkg.package_name}</p>
            <p className="text-xs text-gray-600 mt-1">
              {pkg.description?.substring(0, 100)}...
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Share on social platforms:</h4>
            <div className="grid grid-cols-2 gap-2">
              {shareOptions.map((option) => (
                <Button
                  key={option.name}
                  variant="outline"
                  className={`${option.color} text-white border-none hover:text-white`}
                  onClick={() => handlePlatformShare(option.url)}
                >
                  <option.icon className="w-4 h-4 mr-2" />
                  {option.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Other options:</h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCopyToClipboard}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Text
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleNativeShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Native Share
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
