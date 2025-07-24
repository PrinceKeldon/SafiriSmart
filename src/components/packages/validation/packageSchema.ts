
import { z } from 'zod';

export const packageSchema = z.object({
  package_name: z.string().min(1, 'Package name is required'),
  description: z.string().optional(),
  contact_person: z.string().optional(),
  min_duration: z.number().min(1, 'Minimum duration must be at least 1 day'),
  max_duration: z.number().min(1, 'Maximum duration must be at least 1 day'),
  min_group_size: z.number().min(1, 'Minimum group size must be at least 1'),
  max_group_size: z.number().min(1, 'Maximum group size must be at least 1'),
  budget_tier: z.enum(['budget', 'mid-range', 'luxury']),
  estimated_cost_per_person_per_day: z.number().min(0.01, 'Cost must be positive'),
  included_locations: z.array(z.object({
    value: z.string(),
  })),
  included_activities: z.array(z.object({
    value: z.string(),
  })),
}).refine((data) => data.max_duration >= data.min_duration, {
  message: 'Maximum duration must be greater than or equal to minimum duration',
  path: ['max_duration'],
}).refine((data) => data.max_group_size >= data.min_group_size, {
  message: 'Maximum group size must be greater than or equal to minimum group size',
  path: ['max_group_size'],
});
