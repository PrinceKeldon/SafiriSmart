import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Edit, Save, X, FileText, Download, ExternalLink } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { useUpdateOperatorProfile } from '@/hooks/useOperatorProfile';
import { FileUploadField } from '../FileUploadField';
import { toast } from 'sonner';

type OperatorRow = Tables<'operators'>;

interface EditableDocumentsSectionProps {
  profile: OperatorRow | undefined;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
}

interface DocumentsFormData {
  certificate_of_incorporation_url: string;
  business_permit_url: string;
  kato_membership_url: string;
}

export const EditableDocumentsSection: React.FC<EditableDocumentsSectionProps> = ({
  profile,
  isEditing,
  onEdit,
  onCancel
}) => {
  const updateProfile = useUpdateOperatorProfile();

  const form = useForm<DocumentsFormData>({
    defaultValues: {
      certificate_of_incorporation_url: profile?.certificate_of_incorporation_url || '',
      business_permit_url: profile?.business_permit_url || '',
      kato_membership_url: profile?.kato_membership_url || '',
    },
  });

  React.useEffect(() => {
    if (profile && isEditing) {
      form.reset({
        certificate_of_incorporation_url: profile.certificate_of_incorporation_url || '',
        business_permit_url: profile.business_permit_url || '',
        kato_membership_url: profile.kato_membership_url || '',
      });
    }
  }, [profile, isEditing, form]);

  const onSubmit = async (data: DocumentsFormData) => {
    try {
      const updateData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== '')
      );
      await updateProfile.mutateAsync(updateData);
      toast.success('Documents updated successfully');
      onCancel();
    } catch (error) {
      toast.error('Failed to update documents');
    }
  };

  const documents = [
    {
      label: 'Certificate of Incorporation',
      url: profile?.certificate_of_incorporation_url,
      field: 'certificate_of_incorporation_url' as const
    },
    {
      label: 'Business Permit',
      url: profile?.business_permit_url,
      field: 'business_permit_url' as const
    },
    {
      label: 'KATO Membership Certificate',
      url: profile?.kato_membership_url,
      field: 'kato_membership_url' as const
    }
  ];

  const hasData = documents.some(doc => doc.url && doc.url.length > 0);

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Compliance Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {documents.map((doc) => (
                <FormField
                  key={doc.field}
                  control={form.control}
                  name={doc.field}
                  render={({ field }) => (
                    <FormItem>
                      <FileUploadField
                        label={doc.label}
                        currentUrl={field.value}
                        onUrlChange={(url) => field.onChange(url || '')}
                        disabled={updateProfile.isPending}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <div className="flex gap-2">
                <Button type="submit" disabled={updateProfile.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Compliance Documents
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="space-y-3">
            {documents.map((doc) => (
              doc.url && doc.url.length > 0 && (
                <div key={doc.field} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{doc.label}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No documents uploaded yet.</p>
            <Button variant="outline" className="mt-2" onClick={onEdit}>
              Upload Documents
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};