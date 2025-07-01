
import { z } from 'zod';

export const packageSchema = z.object({
  package_name: z.string().min(1, 'Package name is required').max(255, 'Package name is too long'),
  description: z.string().optional(),
  min_duration: z.number().min(1, 'Minimum duration must be at least 1 day'),
  max_duration: z.number().min(1, 'Maximum duration must be at least 1 day'),
  min_group_size: z.number().min(1, 'Minimum group size must be at least 1 person'),
  max_group_size: z.number().min(1, 'Maximum group size must be at least 1 person'),
  budget_tier: z.enum(['budget', 'mid-range', 'luxury'], {
    required_error: 'Budget tier is required',
  }),
  estimated_cost_per_person_per_day: z.number().min(0.01, 'Cost must be greater than 0'),
  included_locations: z.array(z.object({
    value: z.string().min(1, 'Location cannot be empty'),
  })).default([]),
  included_activities: z.array(z.object({
    value: z.string().min(1, 'Activity cannot be empty'),
  })).default([]),
}).refine(
  (data) => data.max_duration >= data.min_duration,
  {
    message: 'Maximum duration must be greater than or equal to minimum duration',
    path: ['max_duration'],
  }
).refine(
  (data) => data.max_group_size >= data.min_group_size,
  {
    message: 'Maximum group size must be greater than or equal to minimum group size',
    path: ['max_group_size'],
  }
);

export type PackageFormSchema = z.infer<typeof packageSchema>;
