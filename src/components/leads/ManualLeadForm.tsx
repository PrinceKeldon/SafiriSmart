
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DurationStep } from '@/components/preferences/steps/DurationStep';
import { BudgetStep } from '@/components/preferences/steps/BudgetStep';
import { InterestsStep } from '@/components/preferences/steps/InterestsStep';
import { GroupSizeStep } from '@/components/preferences/steps/GroupSizeStep';
import { TravelPaceStep } from '@/components/preferences/steps/TravelPaceStep';

interface ManualLeadFormProps {
  form: UseFormReturn<any>;
}

export const ManualLeadForm: React.FC<ManualLeadFormProps> = ({ form }) => {
  return (
    <div className="space-y-8">
      {/* Traveler Information */}
      <Card>
        <CardHeader>
          <CardTitle>Traveler Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="traveler.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Traveler Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter traveler's full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="traveler.email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="traveler.phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="traveler.country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="Enter country of residence" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Travel Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Travel Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Duration */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Trip Duration</h3>
            <FormField
              control={form.control}
              name="preferences.duration"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DurationStep
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Budget Range */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Budget Range</h3>
            <FormField
              control={form.control}
              name="preferences.budgetRange"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <BudgetStep
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Interests */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Interests & Activities</h3>
            <FormField
              control={form.control}
              name="preferences.interests"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InterestsStep
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Group Size */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Group Size</h3>
            <FormField
              control={form.control}
              name="preferences.groupSize"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <GroupSizeStep
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Travel Pace */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Travel Pace</h3>
            <FormField
              control={form.control}
              name="preferences.travelPace"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <TravelPaceStep
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
