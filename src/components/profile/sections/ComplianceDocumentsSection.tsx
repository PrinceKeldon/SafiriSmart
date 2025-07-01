
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { FileUploadField } from '../FileUploadField';
import { UseFormReturn } from 'react-hook-form';

interface ComplianceDocumentsSectionProps {
  form: UseFormReturn<any>;
  isPending: boolean;
}

export const ComplianceDocumentsSection: React.FC<ComplianceDocumentsSectionProps> = ({ 
  form, 
  isPending 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="certificate_of_incorporation_url"
          render={({ field }) => (
            <FormItem>
              <FileUploadField
                label="Certificate of Incorporation"
                currentUrl={field.value}
                onUrlChange={(url) => field.onChange(url || '')}
                disabled={isPending}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="business_permit_url"
          render={({ field }) => (
            <FormItem>
              <FileUploadField
                label="Business Permit"
                currentUrl={field.value}
                onUrlChange={(url) => field.onChange(url || '')}
                disabled={isPending}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="kato_membership_url"
          render={({ field }) => (
            <FormItem>
              <FileUploadField
                label="KATO Membership Certificate"
                currentUrl={field.value}
                onUrlChange={(url) => field.onChange(url || '')}
                disabled={isPending}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};
