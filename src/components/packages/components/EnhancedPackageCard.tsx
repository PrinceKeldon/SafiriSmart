
import React from 'react';
import { Edit, Trash2, MapPin, Users, Clock, DollarSign, Download, Share2, Eye, Mail, User, Sparkles, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OperatorPackage } from '@/types/operator';
import { PackageDeleteDialog } from './PackageDeleteDialog';

interface EnhancedPackageCardProps {
  pkg: OperatorPackage;
  operatorProfile?: any;
  onEdit: (pkg: OperatorPackage) => void;
  onDelete: (id: string) => void;
  onPreview: (pkg: OperatorPackage) => void;
  onDownload: (pkg: OperatorPackage) => void;
  onShare: (pkg: OperatorPackage) => void;
}

const getBudgetTierStyle = (tier: string) => {
  switch (tier?.toLowerCase()) {
    case 'budget':
      return {
        cardClass: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200',
        badgeClass: 'bg-green-500 text-white',
        accentClass: 'text-green-600',
        iconClass: 'text-green-500'
      };
    case 'mid-range':
      return {
        cardClass: 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200',
        badgeClass: 'bg-blue-500 text-white',
        accentClass: 'text-blue-600',
        iconClass: 'text-blue-500'
      };
    case 'luxury':
      return {
        cardClass: 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200',
        badgeClass: 'bg-purple-500 text-white',
        accentClass: 'text-purple-600',
        iconClass: 'text-purple-500'
      };
    default:
      return {
        cardClass: 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200',
        badgeClass: 'bg-gray-500 text-white',
        accentClass: 'text-gray-600',
        iconClass: 'text-gray-500'
      };
  }
};

export const EnhancedPackageCard: React.FC<EnhancedPackageCardProps> = ({
  pkg,
  operatorProfile,
  onEdit,
  onDelete,
  onPreview,
  onDownload,
  onShare,
}) => {
  const tierStyle = getBudgetTierStyle(pkg.budget_tier);

  return (
    <Card className={`relative hover:shadow-lg transition-all duration-300 ${tierStyle.cardClass}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {(operatorProfile?.company_name || operatorProfile?.company) && (
              <p className="text-xs font-medium text-gray-600 mb-1">
                {operatorProfile.company_name || operatorProfile.company}
              </p>
            )}
            <CardTitle className={`text-lg font-bold ${tierStyle.accentClass}`}>
              {pkg.package_name || 'Untitled Package'}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Sparkles className={`w-4 h-4 ${tierStyle.iconClass}`} />
              <Badge className={`${tierStyle.badgeClass} text-xs font-medium`}>
                {pkg.budget_tier?.charAt(0).toUpperCase() + pkg.budget_tier?.slice(1) || 'Budget'}
              </Badge>
            </div>
          </div>
        </div>
        
        {pkg.description && (
          <p className="text-sm text-gray-700 line-clamp-2 mt-2">{pkg.description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="bg-white/60 rounded-lg p-3 space-y-2">
          {operatorProfile?.email && (
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{operatorProfile.email}</span>
            </div>
          )}
          {operatorProfile?.website_url && (
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-gray-500" />
              <a 
                href={operatorProfile.website_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                {operatorProfile.website_url}
              </a>
            </div>
          )}
          {pkg.contact_person && (
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{pkg.contact_person}</span>
            </div>
          )}
        </div>

        {/* Package Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className={`w-4 h-4 ${tierStyle.iconClass}`} />
            <span className="font-medium">{pkg.min_duration || 1}-{pkg.max_duration || 7} days</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className={`w-4 h-4 ${tierStyle.iconClass}`} />
            <span className="font-medium">{pkg.min_group_size || 1}-{pkg.max_group_size || 10} people</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-white/60 rounded-lg p-2">
          <DollarSign className={`w-4 h-4 ${tierStyle.iconClass}`} />
          <span className={`font-bold ${tierStyle.accentClass}`}>
            ${pkg.estimated_cost_per_person_per_day || 100}/person/day
          </span>
        </div>

        {/* Locations */}
        {pkg.included_locations && pkg.included_locations.length > 0 && (
          <div className="bg-white/60 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className={`w-4 h-4 ${tierStyle.iconClass}`} />
              <span className="text-sm font-medium">Destinations:</span>
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

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 gap-2">
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPreview(pkg)}
              title="Preview package"
              className="hover:bg-white/80"
            >
              <Eye className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(pkg)}
              title="Download package"
              className="hover:bg-white/80"
            >
              <Download className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShare(pkg)}
              title="Share package"
              className="hover:bg-white/80"
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
              className="hover:bg-white/80"
            >
              <Edit className="w-4 h-4" />
            </Button>
            
            <PackageDeleteDialog
              packageName={pkg.package_name || 'this package'}
              onDelete={() => onDelete(pkg.id)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
