
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Edit, Save, X, Shield, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { useUpdateOperatorProfile } from '@/hooks/useOperatorProfile';
import { PdfDocumentUpload } from '../PdfDocumentUpload';
import { ImageDocumentUpload } from '../ImageDocumentUpload';
import { ExternalUrlField } from '../ExternalUrlField';
import { toast } from 'sonner';

type OperatorRow = Tables<'operators'>;

interface ProofOfTrustSectionProps {
  profile: OperatorRow | undefined;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
}

interface ProofOfTrustFormData {
  certificate_of_incorporation_url: string;
  business_permit_url: string;
  kato_membership_url: string;
}

export const ProofOfTrustSection: React.FC<ProofOfTrustSectionProps> = ({
  profile,
  isEditing,
  onEdit,
  onCancel
}) => {
  const updateProfile = useUpdateOperatorProfile();

  const form = useForm<ProofOfTrustFormData>({
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

  const onSubmit = async (data: ProofOfTrustFormData) => {
    try {
      console.log('Submitting proof of trust data:', data);
      
      const updateData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== '')
      );
      
      await updateProfile.mutateAsync(updateData);
      toast.success('Proof of trust updated successfully');
      onCancel();
    } catch (error) {
      console.error('Failed to update proof of trust:', error);
      toast.error('Failed to update proof of trust');
    }
  };

  const hasAnyDocument = [
    profile?.certificate_of_incorporation_url,
    profile?.business_permit_url,
    profile?.kato_membership_url
  ].some(url => url && url.length > 0);
  
  const getVerificationStatus = (): 'none' | 'pending' | 'approved' | 'rejected' => {
    if (!hasAnyDocument) return 'none';
    return 'pending';
  };

  const status = getVerificationStatus();

  const statusConfig = {
    none: {
      icon: XCircle,
      color: 'text-gray-400',
      text: 'No documents uploaded',
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
              Proof of Trust
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Submit verification materials to build trust with potential customers
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="certificate_of_incorporation_url"
                render={({ field }) => (
                  <FormItem>
                    <PdfDocumentUpload
                      label="Upload PDF Document"
                      currentUrl={field.value}
                      onUrlChange={(url) => {
                        console.log('PDF URL changed:', url);
                        field.onChange(url || '');
                      }}
                      disabled={updateProfile.isPending}
                      storagePath="proof-of-trust/pdfs"
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
                    <ImageDocumentUpload
                      label="Upload Image Document"
                      currentUrl={field.value}
                      onUrlChange={(url) => {
                        console.log('Image URL changed:', url);
                        field.onChange(url || '');
                      }}
                      disabled={updateProfile.isPending}
                      storagePath="proof-of-trust/images"
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
                    <ExternalUrlField
                      label="External Verification URL"
                      currentUrl={field.value}
                      onUrlChange={(url) => {
                        console.log('External URL changed:', url);
                        field.onChange(url || '');
                      }}
                      disabled={updateProfile.isPending}
                    />
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
              Proof of Trust
            </CardTitle>  
            <p className="text-sm text-muted-foreground mt-1">
              Submit verification materials to build trust with potential customers
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {hasAnyDocument ? (
          <div className="space-y-4">
            <div className={`flex items-center justify-between p-4 border rounded-lg ${config.bgColor} ${config.borderColor}`}>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Proof of Trust Documents</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusIcon className={`w-4 h-4 ${config.color}`} />
                    <span className={`text-sm font-medium ${config.color}`}>{config.text}</span>
                  </div>
                  {status === 'pending' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Your documents are being reviewed by our admin team
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {profile?.certificate_of_incorporation_url && (
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-sm font-medium">PDF Document</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(profile.certificate_of_incorporation_url, '_blank')}
                  >
                    View PDF
                  </Button>
                </div>
              )}
              
              {profile?.business_permit_url && (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-sm font-medium">Image Document</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(profile.business_permit_url, '_blank')}
                  >
                    View Image
                  </Button>
                </div>
              )}
              
              {profile?.kato_membership_url && (
                <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <span className="text-sm font-medium">External URL</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(profile.kato_membership_url, '_blank')}
                  >
                    Visit Link
                  </Button>
                </div>
              )}
            </div>

            {status === 'rejected' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Documents Rejected</p>
                    <p className="text-sm text-red-700 mt-1">
                      Your verification documents were rejected. Please upload new documents addressing the feedback provided.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onEdit}
                      className="mt-2"
                    >
                      Upload New Documents
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Build Trust with Customers</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Upload verification materials such as business documents, images of your operation, or provide links to establish credibility.
            </p>
            <Button onClick={onEdit}>
              Submit Proof of Trust
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
