
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Image, 
  ExternalLink, 
  Download, 
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { adminService } from '@/services/AdminService';
import { toast } from 'sonner';

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    url: string;
    type: string;
    valid: boolean;
    label: string;
  };
  operatorId: string;
  operatorName: string;
  onDocumentAction: (action: 'approve' | 'reject', notes?: string) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  isOpen,
  onClose,
  document,
  operatorId,
  operatorName,
  onDocumentAction
}) => {
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const getDocumentIcon = () => {
    switch (document.type) {
      case 'pdf': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'image': return <Image className="w-5 h-5 text-green-600" />;
      case 'external_url': return <ExternalLink className="w-5 h-5 text-purple-600" />;
      default: return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }
  };

  const getDocumentColor = () => {
    if (!document.valid) return 'text-red-600 bg-red-50 border-red-200';
    switch (document.type) {
      case 'pdf': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'image': return 'text-green-600 bg-green-50 border-green-200';
      case 'external_url': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleVerify = async () => {
    setProcessing(true);
    try {
      await onDocumentAction('approve', notes);
      toast.success('Document approved successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to approve document');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setProcessing(true);
    try {
      await onDocumentAction('reject', notes);
      toast.success('Document rejected successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to reject document');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    try {
      await adminService.downloadDocument(document.url);
      toast.success('Document downloaded successfully');
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  const handleView = () => {
    window.open(document.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getDocumentIcon()}
            {document.label} - {operatorName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Status */}
          <div className={`border-2 rounded-lg p-4 ${getDocumentColor()}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getDocumentIcon()}
                <span className="font-semibold">{document.label}</span>
              </div>
              <Badge variant={document.valid ? "default" : "destructive"}>
                {document.valid ? 'Valid' : 'Invalid'}
              </Badge>
            </div>
            
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleView}
                className="flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                {document.type === 'external_url' ? 'Visit URL' : 'View Document'}
              </Button>
              
              {document.type !== 'external_url' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              )}
            </div>

            {/* Document Preview */}
            <div className="bg-white rounded-lg border p-4 min-h-[200px] flex items-center justify-center">
              {document.type === 'image' ? (
                <img 
                  src={document.url} 
                  alt={document.label}
                  className="max-w-full max-h-[300px] object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : document.type === 'pdf' ? (
                <div className="text-center">
                  <FileText className="w-16 h-16 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">PDF Document</p>
                  <p className="text-xs text-gray-500">Click "View Document" to open in new tab</p>
                </div>
              ) : (
                <div className="text-center">
                  <ExternalLink className="w-16 h-16 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">External URL</p>
                  <p className="text-xs text-gray-500">Click "Visit URL" to open in new tab</p>
                </div>
              )}
            </div>
          </div>

          {/* Review Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">Review Notes</label>
            <Textarea
              placeholder="Add notes about this document review..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={processing}
            >
              Cancel
            </Button>
            
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !notes.trim()}
              className="flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              {processing ? 'Rejecting...' : 'Reject Document'}
            </Button>
            
            <Button
              onClick={handleVerify}
              disabled={processing}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4" />
              {processing ? 'Verifying...' : 'Verify Document'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
