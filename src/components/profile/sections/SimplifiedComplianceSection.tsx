
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Edit, Save, X, Shield, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { useUpdateOperatorProfile } from '@/hooks/useOperatorProfile';
import { BusinessDocumentUpload } from '../BusinessDocumentUpload';
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
      toast.success('Business verification document updated successfully');
      onCancel();
    } catch (error) {
      console.error('Failed to update business verification document:', error);
      toast.error('Failed to update business verification document');
    }
  };

  const hasDocument = profile?.certificate_of_incorporation_url && profile.certificate_of_incorporation_url.length > 0;
  
  // Enhanced status logic for better UX
  const getVerificationStatus = (): 'none' | 'pending' | 'approved' | 'rejected' => {
    if (!hasDocument) return 'none';
    
    // In a real implementation, this would check against a verification_status table
    // For now, we'll show pending for all uploaded documents
    // This should be extended to check actual verification status from database
    return 'pending';
  };

  const status = getVerificationStatus();

  const statusConfig = {
    none: {
      icon: XCircle,
      color: 'text-gray-400',
      text: 'No document uploaded',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    pending: {
      icon: Clock,
      color: 'text-yellow-600',
      text: 'Under Review',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    approved: {
      icon: CheckCircle,
      color: 'text-green-600',
      text: 'Verified',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    rejected: {
      icon: XCircle,
      color: 'text-red-600',
      text: 'Rejected',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

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
              Upload your business verification document to build trust with customers
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
                    <BusinessDocumentUpload
                      label="Upload Business doc. (PDF)"
                      currentUrl={field.value}
                      onUrlChange={(url) => {
                        console.log('Document URL changed:', url);
                        field.onChange(url || '');
                      }}
                      disabled={updateProfile.isPending}
                    />
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium mb-1">Accepted Documents:</p>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• Business Registration Certificate</li>
                        <li>• Tourism Board License</li>
                        <li>• Certificate of Incorporation</li>
                        <li>• Other official business documentation</li>
                      </ul>
                    </div>
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
              Upload business documentation to verify legitimacy and build trust
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
            <div className={`flex items-center justify-between p-4 border rounded-lg ${config.bgColor} ${config.borderColor}`}>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Business Verification Document</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusIcon className={`w-4 h-4 ${config.color}`} />
                    <span className={`text-sm font-medium ${config.color}`}>{config.text}</span>
                  </div>
                  {status === 'pending' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Your document is being reviewed by our admin team
                    </p>
                  )}
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

            {status === 'rejected' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Document Rejected</p>
                    <p className="text-sm text-red-700 mt-1">
                      Your verification document was rejected. Please upload a new document addressing the feedback provided.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onEdit}
                      className="mt-2"
                    >
                      Upload New Document
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Verify Your Operation</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Upload your business registration certificate, tourism board license, or other official documentation to verify your business legitimacy.
            </p>
            <Button onClick={onEdit}>
              Upload Business Document
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
