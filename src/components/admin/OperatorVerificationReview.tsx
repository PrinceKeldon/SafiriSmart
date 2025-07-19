
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Clock, Eye, FileText, ExternalLink, MessageSquare, Download, Link } from 'lucide-react';
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

  const getVerificationStatus = (operator: OperatorRow): VerificationStatus => {
    // In a real implementation, this would come from a separate verification_status table
    // For now, we'll simulate based on document presence
    const hasDocument = operator.certificate_of_incorporation_url && operator.certificate_of_incorporation_url.length > 0;
    
    if (!hasDocument) {
      return { status: 'pending' };
    }
    
    // Simulate different statuses for demo
    return { status: 'pending' };
  };

  const operatorsNeedingReview = operators.filter(op => {
    const status = getVerificationStatus(op);
    return status.status === 'pending' && op.certificate_of_incorporation_url;
  });

  const handleApproveDocument = async (operator: OperatorRow, approved: boolean) => {
    setProcessing(true);
    try {
      // In a real implementation, you would update a verification_status table
      // For now, we'll use a custom field or simulate the approval
      
      const updateData = {
        // You could add a verification_status field to the operators table
        // verification_status: approved ? 'approved' : 'rejected',
        // verification_reviewed_at: new Date().toISOString(),
        // verification_notes: reviewNotes || null
      };

      const { data, error } = await supabase
        .from('operators')
        .update(updateData)
        .eq('id', operator.id)
        .select()
        .single();

      if (error) throw error;

      toast.success(`Document ${approved ? 'approved' : 'rejected'} successfully`);
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

  const getDocumentType = (url: string) => {
    if (url.includes('supabase')) {
      return 'Uploaded PDF';
    }
    return 'External Link';
  };

  const getFileName = (url: string) => {
    if (url.includes('supabase')) {
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      return lastPart.replace(/^\d+-/, '') || 'Business Document';
    }
    return 'External Document';
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
          <FileText className="w-5 h-5" />
          Verification of Documents ({operatorsNeedingReview.length} pending review)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Review and approve business verification documents submitted by operators
        </p>
      </CardHeader>
      <CardContent>
        {operatorsNeedingReview.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p className="text-lg font-medium">All documents reviewed</p>
            <p className="text-sm">No verification documents pending review</p>
          </div>
        ) : (
          <div className="space-y-6">
            {operatorsNeedingReview.map((operator) => {
              const status = getVerificationStatus(operator);
              const documentType = getDocumentType(operator.certificate_of_incorporation_url!);
              const fileName = getFileName(operator.certificate_of_incorporation_url!);
              const isUploadedFile = operator.certificate_of_incorporation_url!.includes('supabase');
              
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
                      <h5 className="font-medium text-gray-900">Verification Document</h5>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          {isUploadedFile ? <FileText className="w-5 h-5 text-blue-600" /> : <Link className="w-5 h-5 text-blue-600" />}
                          <div>
                            <p className="font-medium text-blue-900">{fileName}</p>
                            <p className="text-xs text-blue-600">{documentType}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(operator.certificate_of_incorporation_url, '_blank')}
                            className="flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Document
                          </Button>
                          {isUploadedFile && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = operator.certificate_of_incorporation_url!;
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
                          Approve Document
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Approve Verification Document</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p>Are you sure you want to approve the business verification document for <strong>{operator.company_name || operator.company}</strong>?</p>
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
                              {processing ? 'Processing...' : 'Approve Document'}
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
                          Reject Document
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reject Verification Document</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to reject the verification document for <strong>{operator.company_name || operator.company}</strong>? 
                            This action will notify the operator to resubmit their documentation.
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
                            {processing ? 'Processing...' : 'Reject Document'}
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
