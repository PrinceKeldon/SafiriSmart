
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Clock, Eye, FileText, ExternalLink, MessageSquare } from 'lucide-react';
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
          Operator Verification Review ({operatorsNeedingReview.length} pending)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {operatorsNeedingReview.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p>No documents pending review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {operatorsNeedingReview.map((operator) => {
              const status = getVerificationStatus(operator);
              
              return (
                <div key={operator.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{operator.company_name || operator.company}</h4>
                      <p className="text-sm text-muted-foreground">{operator.email}</p>
                    </div>
                    <StatusBadge status={status.status} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Company Details:</p>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Registration: {operator.registration_number || 'Not provided'}</p>
                        <p>Contact: {operator.contact_person_name || 'Not provided'}</p>
                        <p>Phone: {operator.contact_person_phone || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Verification Document:</p>
                      {operator.certificate_of_incorporation_url ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(operator.certificate_of_incorporation_url, '_blank')}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Document
                          </Button>
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No document uploaded</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setSelectedOperator(operator)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Approve Verification Document</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p>Are you sure you want to approve the verification document for <strong>{operator.company_name || operator.company}</strong>?</p>
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
                            >
                              {processing ? 'Processing...' : 'Approve'}
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
                          Reject
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reject Verification Document</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to reject the verification document for {operator.company_name || operator.company}? 
                            This action will notify the operator to resubmit their documentation.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="my-4">
                          <label className="text-sm font-medium">Rejection Reason</label>
                          <Textarea
                            placeholder="Please provide a reason for rejection..."
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
                          >
                            {processing ? 'Processing...' : 'Reject'}
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
