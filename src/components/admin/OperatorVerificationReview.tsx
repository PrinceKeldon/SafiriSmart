
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Clock, Eye, FileText, ExternalLink, Download, Link, Image, Shield, AlertTriangle } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type OperatorRow = Tables<'operators'>;

interface OperatorVerificationReviewProps {
  operators: OperatorRow[];
  onOperatorUpdate: (updatedOperator: OperatorRow) => void;
}

interface VerificationStatus {
  status: 'pending' | 'approved' | 'rejected';
  reviewedAt?: string;
  reviewNotes?: string;
}

export const OperatorVerificationReview: React.FC<OperatorVerificationReviewProps> = ({
  operators,
  onOperatorUpdate
}) => {
  const [selectedOperator, setSelectedOperator] = useState<OperatorRow | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const isValidPdfUrl = (url: string) => {
    return url.includes('.pdf') || (url.includes('supabase') && url.includes('pdf-uploads'));
  };

  const isValidImageUrl = (url: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];
    const hasImageExtension = imageExtensions.some(ext => url.toLowerCase().includes(ext));
    const isFromImageStorage = url.includes('supabase') && url.includes('image-uploads');
    return hasImageExtension || isFromImageStorage;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') && 
             !url.includes('supabase'); // External URLs should not be from our storage
    } catch {
      return false;
    }
  };

  const getVerificationStatus = (operator: OperatorRow): VerificationStatus => {
    const hasValidPdf = operator.certificate_of_incorporation_url && isValidPdfUrl(operator.certificate_of_incorporation_url);
    const hasValidImage = operator.business_permit_url && isValidImageUrl(operator.business_permit_url);
    const hasValidUrl = operator.kato_membership_url && isValidUrl(operator.kato_membership_url);
    
    if (hasValidPdf || hasValidImage || hasValidUrl) {
      return { status: 'pending' };
    }
    
    return { status: 'pending' };
  };

  const operatorsNeedingReview = operators.filter(op => {
    const status = getVerificationStatus(op);
    const hasAnyValidProofOfTrust = [
      op.certificate_of_incorporation_url && isValidPdfUrl(op.certificate_of_incorporation_url),
      op.business_permit_url && isValidImageUrl(op.business_permit_url),
      op.kato_membership_url && isValidUrl(op.kato_membership_url)
    ].some(Boolean);
    return status.status === 'pending' && hasAnyValidProofOfTrust;
  });

  const handleApproveDocument = async (operator: OperatorRow, approved: boolean) => {
    setProcessing(true);
    try {
      const updateData = {};

      const { data, error } = await supabase
        .from('operators')
        .update(updateData)
        .eq('id', operator.id)
        .select()
        .single();

      if (error) throw error;

      toast.success(`Proof of Trust ${approved ? 'approved' : 'rejected'} successfully`);
      onOperatorUpdate(data);
      setReviewNotes('');
      setSelectedOperator(null);
    } catch (error) {
      console.error('Error updating verification status:', error);
      toast.error('Failed to update verification status');
    } finally {
      setProcessing(false);
    }
  };

  const getDocumentType = (url: string, field: string) => {
    if (field === 'certificate_of_incorporation_url' && isValidPdfUrl(url)) {
      return 'PDF Document';
    }
    if (field === 'business_permit_url' && isValidImageUrl(url)) {
      return 'Image Document';
    }
    if (field === 'kato_membership_url' && isValidUrl(url)) {
      return 'External URL';
    }
    return 'Invalid Entry';
  };

  const getFileName = (url: string) => {
    if (url.includes('supabase')) {
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      return lastPart.replace(/^\d+-/, '') || 'Document';
    }
    return url;
  };

  const getDocumentIcon = (url: string, field: string) => {
    const type = getDocumentType(url, field);
    if (type === 'PDF Document') return FileText;
    if (type === 'Image Document') return Image;
    if (type === 'External URL') return Link;
    return XCircle;
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const variants = {
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      approved: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      rejected: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' }
    };

    const config = variants[status as keyof typeof variants];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`w-3 h-3 ${config.color}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Proof of Trust Review ({operatorsNeedingReview.length} pending review)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Review and verify proof of trust materials submitted by operators
        </p>
      </CardHeader>
      <CardContent>
        {operatorsNeedingReview.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p className="text-lg font-medium">All submissions reviewed</p>
            <p className="text-sm">No proof of trust materials pending review</p>
          </div>
        ) : (
          <div className="space-y-6">
            {operatorsNeedingReview.map((operator) => {
              const status = getVerificationStatus(operator);
              
              // Get valid proof of trust documents
              const validProofOfTrustDocs = [
                { 
                  url: operator.certificate_of_incorporation_url, 
                  field: 'certificate_of_incorporation_url',
                  label: 'PDF Document',
                  isValid: operator.certificate_of_incorporation_url && isValidPdfUrl(operator.certificate_of_incorporation_url)
                },
                { 
                  url: operator.business_permit_url, 
                  field: 'business_permit_url',
                  label: 'Image Document',
                  isValid: operator.business_permit_url && isValidImageUrl(operator.business_permit_url)
                },
                { 
                  url: operator.kato_membership_url, 
                  field: 'kato_membership_url',
                  label: 'External URL',
                  isValid: operator.kato_membership_url && isValidUrl(operator.kato_membership_url)
                }
              ].filter(doc => doc.url && doc.url.length > 0);
              
              return (
                <div key={operator.id} className="border rounded-lg p-6 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">{operator.company_name || operator.company}</h4>
                      <p className="text-sm text-muted-foreground">{operator.email}</p>
                    </div>
                    <StatusBadge status={status.status} />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-900">Company Information</h5>
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Registration:</span>
                          <span className="font-medium">{operator.registration_number || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Contact Person:</span>
                          <span className="font-medium">{operator.contact_person_name || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">{operator.contact_person_phone || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium">{operator.city || 'Not provided'}, {operator.country}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-900">Proof of Trust</h5>
                      <div className="space-y-3">
                        {validProofOfTrustDocs.map((doc, index) => {
                          const docType = getDocumentType(doc.url, doc.field);
                          const fileName = getFileName(doc.url);
                          const DocIcon = getDocumentIcon(doc.url, doc.field);
                          const isUploadedFile = doc.url.includes('supabase');
                          const isValidEntry = doc.isValid;
                          
                          return (
                            <div key={index} className={`border rounded-lg p-4 ${
                              isValidEntry 
                                ? docType === 'PDF Document' 
                                  ? 'bg-blue-50 border-blue-200' 
                                  : docType === 'Image Document'
                                  ? 'bg-green-50 border-green-200'
                                  : 'bg-purple-50 border-purple-200'
                                : 'bg-red-50 border-red-200'
                            }`}>
                              <div className="flex items-center gap-3 mb-3">
                                <DocIcon className={`w-5 h-5 ${
                                  isValidEntry 
                                    ? docType === 'PDF Document' 
                                      ? 'text-blue-600' 
                                      : docType === 'Image Document'
                                      ? 'text-green-600'
                                      : 'text-purple-600'
                                    : 'text-red-600'
                                }`} />
                                <div>
                                  <p className={`font-medium ${
                                    isValidEntry 
                                      ? docType === 'PDF Document' 
                                        ? 'text-blue-900' 
                                        : docType === 'Image Document'
                                        ? 'text-green-900'
                                        : 'text-purple-900'
                                      : 'text-red-900'
                                  }`}>
                                    {isValidEntry ? fileName : 'Invalid Entry'}
                                  </p>
                                  <p className={`text-xs ${
                                    isValidEntry 
                                      ? docType === 'PDF Document' 
                                        ? 'text-blue-600' 
                                        : docType === 'Image Document'
                                        ? 'text-green-600'
                                        : 'text-purple-600'
                                      : 'text-red-600'
                                  }`}>
                                    {isValidEntry ? docType : 'Not a valid ' + doc.label.toLowerCase()}
                                  </p>
                                </div>
                              </div>
                              {isValidEntry && (
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(doc.url, '_blank', 'noopener,noreferrer')}
                                    className="flex items-center gap-2"
                                  >
                                    <Eye className="w-4 h-4" />
                                    {docType === 'External URL' ? 'Visit Link' : 'View Document'}
                                  </Button>
                                  {isUploadedFile && docType !== 'External URL' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = doc.url;
                                        link.download = fileName;
                                        link.click();
                                      }}
                                      className="flex items-center gap-2"
                                    >
                                      <Download className="w-4 h-4" />
                                      Download
                                    </Button>
                                  )}
                                </div>
                              )}
                              {!isValidEntry && (
                                <div className="flex items-center gap-2 mt-2">
                                  <AlertTriangle className="w-4 h-4 text-red-600" />
                                  <span className="text-xs text-red-600">
                                    This entry should be removed and re-uploaded in the correct format
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setSelectedOperator(operator)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve Proof of Trust
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Approve Proof of Trust</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p>Are you sure you want to approve the proof of trust materials for <strong>{operator.company_name || operator.company}</strong>?</p>
                          <div>
                            <label className="text-sm font-medium">Review Notes (Optional)</label>
                            <Textarea
                              placeholder="Add any notes about the approval..."
                              value={reviewNotes}
                              onChange={(e) => setReviewNotes(e.target.value)}
                              className="mt-2"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleApproveDocument(operator, true)}
                              disabled={processing}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {processing ? 'Processing...' : 'Approve Proof of Trust'}
                            </Button>
                            <DialogTrigger asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogTrigger>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setSelectedOperator(operator)}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject Proof of Trust
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reject Proof of Trust</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to reject the proof of trust materials for <strong>{operator.company_name || operator.company}</strong>? 
                            This action will notify the operator to resubmit their materials.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="my-4">
                          <label className="text-sm font-medium">Rejection Reason (Required)</label>
                          <Textarea
                            placeholder="Please provide a clear reason for rejection..."
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            className="mt-2"
                            required
                          />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleApproveDocument(operator, false)}
                            disabled={processing || !reviewNotes.trim()}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {processing ? 'Processing...' : 'Reject Proof of Trust'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
