
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  Download, 
  Eye, 
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services/AdminService';

interface DocumentInfo {
  url: string;
  valid: boolean;
  type: string;
}

interface ProofOfTrustCardProps {
  documents: {
    certificate_of_incorporation?: DocumentInfo;
    business_permit?: DocumentInfo;
    kato_membership?: DocumentInfo;
  };
  operatorId: string;
  operatorName: string;
  verificationStatus?: string;
  verificationNotes?: string;
  onDocumentAction?: (documentType: string, action: 'approve' | 'reject', notes?: string) => Promise<void>;
}

export const ProofOfTrustCard: React.FC<ProofOfTrustCardProps> = ({
  documents,
  operatorId,
  operatorName,
  verificationStatus = 'pending',
  verificationNotes,
  onDocumentAction
}) => {
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const documentTypes = [
    {
      key: 'certificate_of_incorporation',
      label: 'Certificate of Incorporation',
      icon: FileText,
      description: 'Legal incorporation document (PDF)'
    },
    {
      key: 'business_permit',
      label: 'Business Permit',
      icon: ImageIcon,
      description: 'Valid business operating permit (Image)'
    },
    {
      key: 'kato_membership',
      label: 'KATO Membership',
      icon: LinkIcon,
      description: 'Kenya Association of Tour Operators membership'
    }
  ];

  const getStatusConfig = () => {
    switch (verificationStatus) {
      case 'approved':
        return {
          label: 'Approved',
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'rejected':
        return {
          label: 'Rejected',
          icon: XCircle,
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'under_review':
        return {
          label: 'Under Review',
          icon: Eye,
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      default:
        return {
          label: 'Pending Review',
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const handleDownload = async (url: string, filename: string) => {
    try {
      await adminService.downloadDocument(url);
      toast.success(`Downloaded ${filename}`);
    } catch (error) {
      toast.error(`Failed to download ${filename}`);
    }
  };

  const handleApproveAll = async () => {
    if (!onDocumentAction) return;
    
    setIsProcessing(true);
    try {
      await onDocumentAction('all', 'approve', approvalNotes || 'All documents approved');
      toast.success('Documents approved successfully');
      setApprovalNotes('');
    } catch (error) {
      toast.error('Failed to approve documents');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectAll = async () => {
    if (!onDocumentAction || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    setIsProcessing(true);
    try {
      await onDocumentAction('all', 'reject', rejectionReason);
      toast.success('Documents rejected');
      setRejectionReason('');
    } catch (error) {
      toast.error('Failed to reject documents');
    } finally {
      setIsProcessing(false);
    }
  };

  const validDocumentsCount = Object.values(documents).filter(doc => doc?.valid).length;
  const totalDocuments = Object.keys(documents).length;

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Proof of Trust Documents</CardTitle>
          </div>
          
          <Badge 
            variant="outline" 
            className={`flex items-center gap-1 ${statusConfig.className}`}
          >
            <StatusIcon className="w-3 h-3" />
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Document Status Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Document Status</span>
            <span className="text-sm text-gray-600">
              {validDocumentsCount}/{totalDocuments} documents uploaded
            </span>
          </div>
          
          {verificationNotes && (
            <div className="mt-2 p-2 bg-white rounded border-l-4 border-blue-500">
              <p className="text-sm text-gray-700">{verificationNotes}</p>
            </div>
          )}
        </div>

        {/* Document List */}
        <div className="space-y-3">
          {documentTypes.map(({ key, label, icon: Icon, description }) => {
            const doc = documents[key as keyof typeof documents];
            
            return (
              <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-gray-500">{description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {doc?.valid ? (
                    <>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        ✓ Uploaded
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(doc.url, label)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      {doc.type === 'external_url' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      )}
                    </>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                      Not uploaded
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Admin Action Buttons */}
        {onDocumentAction && validDocumentsCount > 0 && verificationStatus !== 'approved' && (
          <div className="flex gap-2 pt-4 border-t">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="default" 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isProcessing}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve All
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Approve Documents</DialogTitle>
                  <DialogDescription>
                    Approve all documents for {operatorName}. You can add optional notes.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="approval-notes">Approval Notes (Optional)</Label>
                    <Textarea
                      id="approval-notes"
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      placeholder="Add any notes for the operator..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <DialogTrigger asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogTrigger>
                    <Button 
                      onClick={handleApproveAll}
                      disabled={isProcessing}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isProcessing ? 'Processing...' : 'Approve Documents'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={isProcessing}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject All
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reject Documents</DialogTitle>
                  <DialogDescription>
                    Reject all documents for {operatorName}. Please provide a reason.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                    <Textarea
                      id="rejection-reason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Please explain why the documents are being rejected..."
                      rows={3}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <DialogTrigger asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogTrigger>
                    <Button 
                      onClick={handleRejectAll}
                      disabled={isProcessing || !rejectionReason.trim()}
                      variant="destructive"
                    >
                      {isProcessing ? 'Processing...' : 'Reject Documents'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
