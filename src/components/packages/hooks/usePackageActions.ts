import { useOperatorProfile } from '@/hooks/useOperatorProfile';
import { useDeleteOperatorPackage } from '@/hooks/useOperatorPackages';
import { OperatorPackage } from '@/types/operator';
import { toast } from 'sonner';

export const usePackageActions = () => {
  const deletePackage = useDeleteOperatorPackage();
  const { data: operatorProfile } = useOperatorProfile();

  const handleDelete = async (id: string) => {
    try {
      await deletePackage.mutateAsync(id);
      toast.success('Package deleted successfully');
    } catch (error) {
      toast.error('Failed to delete package');
    }
  };

  const handleShare = async (pkg: OperatorPackage) => {
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

  return {
    handleDelete,
    handleShare,
    operatorProfile,
  };
};