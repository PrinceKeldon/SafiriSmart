
import React, { useState } from 'react';
import { Edit, Trash2, MapPin, Users, Clock, DollarSign, Download, Share2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { OperatorPackage } from '@/types/operator';
import { useDeleteOperatorPackage } from '@/hooks/useOperatorPackages';
import { PackagePreviewModal } from './PackagePreviewModal';
import { toast } from 'sonner';

interface PackageListProps {
  packages: OperatorPackage[];
  onEdit: (pkg: OperatorPackage) => void;
}

export const PackageList: React.FC<PackageListProps> = ({ packages, onEdit }) => {
  const deletePackage = useDeleteOperatorPackage();
  const [previewPackage, setPreviewPackage] = useState<OperatorPackage | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleDelete = async (id: string) => {
    try {
      await deletePackage.mutateAsync(id);
      toast.success('Package deleted successfully');
    } catch (error) {
      toast.error('Failed to delete package');
    }
  };

  const handlePreview = (pkg: OperatorPackage) => {
    setPreviewPackage(pkg);
    setIsPreviewOpen(true);
  };

  const generatePackageImage = async (pkg: OperatorPackage) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

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

    // Header
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(pkg.package_name, 30, 60);

    // Budget tier badge
    const budgetColors = {
      budget: '#059669',
      'mid-range': '#2563eb',
      luxury: '#7c3aed'
    };
    ctx.fillStyle = budgetColors[pkg.budget_tier as keyof typeof budgetColors] || '#6b7280';
    ctx.fillRect(30, 80, 120, 30);
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.fillText(pkg.budget_tier || 'budget', 40, 100);

    // Description
    ctx.fillStyle = '#374151';
    ctx.font = '18px Arial';
    const description = pkg.description || '';
    const words = description.split(' ');
    let line = '';
    let y = 150;
    
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

  const handleDownload = async (pkg: OperatorPackage) => {
    try {
      const canvas = await generatePackageImage(pkg);
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

  const handleShare = async (pkg: OperatorPackage) => {
    const shareText = `${pkg.package_name}\n\n${pkg.description}\n\nDuration: ${pkg.min_duration}-${pkg.max_duration} days\nGroup Size: ${pkg.min_group_size}-${pkg.max_group_size} people\nBudget: ${pkg.budget_tier}\nCost: $${pkg.estimated_cost_per_person_per_day}/person/day`;
    
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

  if (!packages || packages.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-gray-500 text-center">
            <h3 className="text-lg font-medium mb-2">No packages created yet</h3>
            <p>Create your first tour package to start managing your pricing</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="relative hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{pkg.package_name || 'Untitled Package'}</CardTitle>
                <Badge className={getBudgetTierColor(pkg.budget_tier || 'budget')}>
                  {pkg.budget_tier || 'budget'}
                </Badge>
              </div>
              {pkg.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{pkg.description}</p>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{pkg.min_duration || 1}-{pkg.max_duration || 7} days</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{pkg.min_group_size || 1}-{pkg.max_group_size || 10} people</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="font-medium">
                  ${pkg.estimated_cost_per_person_per_day || 100}/person/day
                </span>
              </div>

              {pkg.included_locations && pkg.included_locations.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">Locations:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {pkg.included_locations.slice(0, 3).map((location, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {location}
                      </Badge>
                    ))}
                    {pkg.included_locations.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{pkg.included_locations.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4 gap-2">
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(pkg)}
                    title="Preview package"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(pkg)}
                    title="Download package"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(pkg)}
                    title="Share package"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(pkg)}
                    title="Edit package"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" title="Delete package">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Package</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{pkg.package_name || 'this package'}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(pkg.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PackagePreviewModal
        package={previewPackage}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewPackage(null);
        }}
      />
    </>
  );
};
