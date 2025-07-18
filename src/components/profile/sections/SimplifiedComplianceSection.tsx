
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Edit, Save, X, Shield, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { useUpdateOperatorProfile } from '@/hooks/useOperatorProfile';
import { EnhancedFileUploadField } from '../EnhancedFileUploadField';
import { toast } from 'sonner';

type OperatorRow = Tables<'operators'>;

interface SimplifiedComplianceSectionProps {
  profile: OperatorRow | undefined;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
}

interface ComplianceFormData {
  certificate_of_incorporation_url: string;
}

export const SimplifiedComplianceSection: React.FC<SimplifiedComplianceSectionProps> = ({
  profile,
  isEditing,
  onEdit,
  onCancel
}) => {
  const updateProfile = useUpdateOperatorProfile();

  const form = useForm<ComplianceFormData>({
    defaultValues: {
      certificate_of_incorporation_url: profile?.certificate_of_incorporation_url || '',
    },
  });

  React.useEffect(() => {
    if (profile && isEditing) {
      form.reset({
        certificate_of_incorporation_url: profile.certificate_of_incorporation_url || '',
      });
    }
  }, [profile, isEditing, form]);

  const onSubmit = async (data: ComplianceFormData) => {
    try {
      console.log('Submitting compliance data:', data);
      
      const updateData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== '')
      );
      
      await updateProfile.mutateAsync(updateData);
      toast.success('Verification document updated successfully');
      onCancel();
    } catch (error) {
      console.error('Failed to update verification document:', error);
      toast.error('Failed to update verification document');
    }
  };

  const hasDocument = profile?.certificate_of_incorporation_url && profile.certificate_of_incorporation_url.length > 0;
  
  // Simple status logic - in a real system this would be managed by admin review
  const getVerificationStatus = () => {
    if (!hasDocument) return 'none';
    return 'pending'; // In production, this would be determined by admin review
  };

  const status = getVerificationStatus();

  const StatusIcon = {
    none: XCircle,
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle
  }[status];

  const statusColor = {
    none: 'text-gray-400',
    pending: 'text-yellow-500',
    approved: 'text-green-500',
    rejected: 'text-red-500'
  }[status];

  const statusText = {
    none: 'No document uploaded',
    pending: 'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected'
  }[status];

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Verify your operation
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Provide verifiable proof the business is legit
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="certificate_of_incorporation_url"
                render={({ field }) => (
                  <FormItem>
                    <EnhancedFileUploadField
                      label="Business Verification Document"
                      currentUrl={field.value}
                      onUrlChange={(url) => {
                        console.log('URL changed:', url);
                        field.onChange(url || '');
                      }}
                      disabled={updateProfile.isPending}
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Upload your business registration certificate, tourism board license, or other official documentation that proves your business legitimacy. You can upload a file or provide a URL link.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button type="submit" disabled={updateProfile.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
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
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Verify your operation
            </CardTitle>  
            <p className="text-sm text-muted-foreground mt-1">
              Provide verifiable proof the business is legit
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {hasDocument ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Business Verification Document</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                    <span className={`text-sm ${statusColor}`}>{statusText}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(profile.certificate_of_incorporation_url, '_blank')}
              >
                View Document
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Verify Your Operation</h3>
            <p className="text-muted-foreground mb-4">
              Upload documentation to verify your business is legitimate and build trust with customers.
            </p>
            <Button onClick={onEdit}>
              Upload Verification Document
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 
