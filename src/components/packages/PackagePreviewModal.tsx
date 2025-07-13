import React from 'react';
import { X, MapPin, Users, Clock, DollarSign, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { OperatorPackage } from '@/types/operator';
import { useOperatorProfile } from '@/hooks/useOperatorProfile';
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

  const getBudgetTierColor = (tier: string) => {
    switch (tier) {
      case 'budget':
        return 'bg-green-100 text-green-800';
      case 'mid-range':
        return 'bg-blue-100 text-blue-800';
      case 'luxury':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const generatePackageImage = async () => {
    if (!pkg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 1000;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add border
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Company name (if available)
    let y = 40;
    if (operatorProfile?.company_name || operatorProfile?.company) {
      ctx.fillStyle = '#6b7280';
      ctx.font = 'bold 20px Arial';
      ctx.fillText(operatorProfile.company_name || operatorProfile.company, 30, y);
      y += 40;
    }

    // Header
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(pkg.package_name, 30, y);
    y += 40;

    // Budget tier badge
    const budgetColors = {
      budget: '#059669',
      'mid-range': '#2563eb',
      luxury: '#7c3aed'
    };
    ctx.fillStyle = budgetColors[pkg.budget_tier as keyof typeof budgetColors] || '#6b7280';
    ctx.fillRect(30, y, 120, 30);
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.fillText(pkg.budget_tier || 'budget', 40, y + 20);
    y += 50;

    // Description
    ctx.fillStyle = '#374151';
    ctx.font = '18px Arial';
    const description = pkg.description || '';
    const words = description.split(' ');
    let line = '';
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > 740 && n > 0) {
        ctx.fillText(line, 30, y);
        line = words[n] + ' ';
        y += 25;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 30, y);

    // Details section
    y += 50;
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Package Details', 30, y);

    y += 40;
    ctx.fillStyle = '#374151';
    ctx.font = '18px Arial';
    ctx.fillText(`Duration: ${pkg.min_duration}-${pkg.max_duration} days`, 30, y);
    
    y += 30;
    ctx.fillText(`Group Size: ${pkg.min_group_size}-${pkg.max_group_size} people`, 30, y);
    
    y += 30;
    ctx.fillText(`Cost: $${pkg.estimated_cost_per_person_per_day}/person/day`, 30, y);

    // Locations
    if (pkg.included_locations && pkg.included_locations.length > 0) {
      y += 50;
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 20px Arial';
      ctx.fillText('Included Locations:', 30, y);
      
      y += 30;
      ctx.fillStyle = '#374151';
      ctx.font = '16px Arial';
      pkg.included_locations.forEach((location) => {
        ctx.fillText(`• ${location}`, 50, y);
        y += 25;
      });
    }

    // Activities
    if (pkg.included_activities && pkg.included_activities.length > 0) {
      y += 30;
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 20px Arial';
      ctx.fillText('Included Activities:', 30, y);
      
      y += 30;
      ctx.fillStyle = '#374151';
      ctx.font = '16px Arial';
      pkg.included_activities.forEach((activity) => {
        ctx.fillText(`• ${activity}`, 50, y);
        y += 25;
      });
    }

    // Footer
    y += 50;
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Arial';
    ctx.fillText(`Created: ${new Date(pkg.created_at).toLocaleDateString()}`, 30, y);

    return canvas;
  };

  const handleDownload = async () => {
    if (!pkg) return;
    
    try {
      const canvas = await generatePackageImage();
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

        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <Badge className={getBudgetTierColor(pkg.budget_tier || 'budget')}>
              {pkg.budget_tier || 'budget'}
            </Badge>
          </div>

          {pkg.description && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {pkg.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium">{pkg.min_duration}-{pkg.max_duration} days</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Users className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Group Size</p>
                <p className="font-medium">{pkg.min_group_size}-{pkg.max_group_size} people</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Cost per Day</p>
                <p className="font-medium">${pkg.estimated_cost_per_person_per_day}/person</p>
              </div>
            </div>
          </div>

          {pkg.included_locations && pkg.included_locations.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <h3 className="font-semibold text-lg">Included Locations</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {pkg.included_locations.map((location, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {location}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {pkg.included_activities && pkg.included_activities.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Included Activities</h3>
              <div className="flex flex-wrap gap-2">
                {pkg.included_activities.map((activity, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {activity}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500">
              Created: {new Date(pkg.created_at).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500">
              Last updated: {new Date(pkg.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
