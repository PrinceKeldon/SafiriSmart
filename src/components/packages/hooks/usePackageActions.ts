
import { useState } from 'react';
import { useOperatorProfile } from '@/hooks/useOperatorProfile';
import { useDeleteOperatorPackage } from '@/hooks/useOperatorPackages';
import { OperatorPackage } from '@/types/operator';
import { toast } from 'sonner';

export const usePackageActions = () => {
  const deletePackage = useDeleteOperatorPackage();
  const { data: operatorProfile } = useOperatorProfile();
  const [sharePackage, setSharePackage] = useState<OperatorPackage | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleDelete = async (id: string) => {
    try {
      await deletePackage.mutateAsync(id);
      toast.success('Package deleted successfully');
    } catch (error) {
      toast.error('Failed to delete package');
    }
  };

  const handleShare = (pkg: OperatorPackage) => {
    setSharePackage(pkg);
    setIsShareModalOpen(true);
  };

  const closeShareModal = () => {
    setIsShareModalOpen(false);
    setSharePackage(null);
  };

  return {
    handleDelete,
    handleShare,
    operatorProfile,
    sharePackage,
    isShareModalOpen,
    closeShareModal,
  };
};
