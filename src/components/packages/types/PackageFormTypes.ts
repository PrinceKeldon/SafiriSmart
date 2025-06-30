
import { OperatorPackage } from '@/types/operator';

export interface PackageFormData {
  package_name: string;
  description?: string;
  min_duration: number;
  max_duration: number;
  min_group_size: number;
  max_group_size: number;
  budget_tier: 'budget' | 'mid-range' | 'luxury';
  estimated_cost_per_person_per_day: number;
  included_locations: { value: string }[];
  included_activities: { value: string }[];
}

export interface PackageFormProps {
  isOpen: boolean;
  onClose: () => void;
  package?: OperatorPackage | null;
}
