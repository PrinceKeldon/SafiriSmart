import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ServicesDestinationsSectionProps {
  form: UseFormReturn<any>;
}

const AVAILABLE_SERVICES = [
  'Wildlife Safari',
  'Cultural Tours',
  'Beach Holidays',
  'Mountain Climbing',
  'Bird Watching',
  'Photography Tours',
  'Adventure Tours',
  'Luxury Safari',
  'Budget Safari',
  'Family Tours',
  'Honeymoon Packages',
  'Corporate Tours'
];

const KENYAN_DESTINATIONS = [
  'Masai Mara',
  'Amboseli',
  'Tsavo East',
  'Tsavo West',
  'Samburu',
  'Lake Nakuru',
  'Lake Naivasha',
  'Diani Beach',
  'Watamu',
  'Malindi',
  'Mount Kenya',
  'Aberdare',
  'Meru National Park',
  'Hell\'s Gate',
  'Nairobi National Park'
];

export const ServicesDestinationsSection: React.FC<ServicesDestinationsSectionProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Services Offered</CardTitle>
          <CardDescription>
            Select the types of tours and services your company provides
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="services_offered"
            render={() => (
              <FormItem>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {AVAILABLE_SERVICES.map((service) => (
                    <FormField
                      key={service}
                      control={form.control}
                      name="services_offered"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={service}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(service)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, service])
                                    : field.onChange(
                                        field.value?.filter((value: string) => value !== service)
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {service}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Destinations Covered</CardTitle>
          <CardDescription>
            Select the destinations and parks your company operates in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="destinations_covered"
            render={() => (
              <FormItem>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {KENYAN_DESTINATIONS.map((destination) => (
                    <FormField
                      key={destination}
                      control={form.control}
                      name="destinations_covered"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={destination}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(destination)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, destination])
                                    : field.onChange(
                                        field.value?.filter((value: string) => value !== destination)
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {destination}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
};