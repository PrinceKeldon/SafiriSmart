
import React, { useState } from 'react';
import { OperatorPackage } from '@/types/operator';
import { PackagePreviewModal } from './PackagePreviewModal';
import { EnhancedPackageCard } from './components/EnhancedPackageCard';
import { EmptyPackageState } from './components/EmptyPackageState';
import { usePackageActions } from './hooks/usePackageActions';
import { downloadPackageImage } from './utils/packageImageGenerator';
import { toast } from 'sonner';

interface PackageListProps {
  packages: OperatorPackage[];
  onEdit: (pkg: OperatorPackage) => void;
}

export const PackageList: React.FC<PackageListProps> = ({ packages, onEdit }) => {
  const { handleDelete, handleShare, operatorProfile } = usePackageActions();
  const [previewPackage, setPreviewPackage] = useState<OperatorPackage | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePreview = (pkg: OperatorPackage) => {
    setPreviewPackage(pkg);
    setIsPreviewOpen(true);
  };

  const handleDownload = async (pkg: OperatorPackage) => {
    try {
      await downloadPackageImage(pkg, operatorProfile);
      toast.success('Package image downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate package image');
    }
  };

  if (!packages || packages.length === 0) {
    return <EmptyPackageState />;
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <EnhancedPackageCard
            key={pkg.id}
            pkg={pkg}
            operatorProfile={operatorProfile}
            onEdit={onEdit}
            onDelete={handleDelete}
            onPreview={handlePreview}
            onDownload={handleDownload}
            onShare={handleShare}
          />
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
