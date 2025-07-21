
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Image, 
  ExternalLink, 
  Eye,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield
} from 'lucide-react';
import { DocumentViewer } from './DocumentViewer';

interface ProofOfTrustCardProps {
  documents: {
    certificate_of_incorporation?: { url: string; valid: boolean; type: string };
    business_permit?: { url: string; valid: boolean; type: string };
    kato_membership?: { url: string; valid: boolean; type: string };
  };
  operatorId: string;
  operatorName: string;
  onDocumentAction: (documentType: string, action: 'approve' | 'reject', notes?: string) => void;
}

export const ProofOfTrustCard: React.FC<ProofOfTrustCardProps> = ({
  documents,
  operatorId,
  operatorName,
  onDocumentAction
}) => {
  const [selectedDocument, setSelectedDocument] = useState<{
    url: string;
    type: string;
    valid: boolean;
    label: string;
    key: string;
  } | null>(null);

  const documentEntries = [
    {
      key: 'certificate_of_incorporation',
      label: 'Certificate of Incorporation',
      doc: documents.certificate_of_incorporation,
      expectedType: 'PDF'
    },
    {
      key: 'business_permit',
      label: 'Business Permit',
      doc: documents.business_permit,
      expectedType: 'Image'
    },
    {
      key: 'kato_membership',
      label: 'KATO Membership',
      doc: documents.kato_membership,
      expectedType: 'URL'
    }
  ].filter(entry => entry.doc);

  const validDocuments = documentEntries.filter(entry => entry.doc?.valid);
  const hasValidDocuments = validDocuments.length > 0;

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'pdf': return FileText;
      case 'image': return Image;
      case 'external_url': return ExternalLink;
      default: return AlertTriangle;
    }
  };

  const getDocumentColor = (type: string, valid: boolean) => {
    if (!valid) return 'text-red-600 bg-red-50 border-red-200';
    switch (type) {
      case 'pdf': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'image': return 'text-green-600 bg-green-50 border-green-200';
      case 'external_url': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getFileName = (url: string) => {
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    return fileName.replace(/^\d+-/, '') || 'Document';
  };

  const handleDocumentClick = (entry: any) => {
    setSelectedDocument({
      url: entry.doc.url,
      type: entry.doc.type,
      valid: entry.doc.valid,
      label: entry.label,
      key: entry.key
    });
  };

  const handleDocumentAction = async (action: 'approve' | 'reject', notes?: string) => {
    if (selectedDocument) {
      await onDocumentAction(selectedDocument.key, action, notes);
      setSelectedDocument(null);
    }
  };

  if (documentEntries.length === 0) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-gray-500" />
            Proof of Trust Documents
            <Badge variant="secondary" className="text-xs">
              No documents submitted
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertTriangle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No documents have been submitted yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-gray-600" />
            Proof of Trust Documents
            <Badge 
              variant={hasValidDocuments ? "default" : "destructive"}
              className="text-xs"
            >
              {validDocuments.length}/{documentEntries.length} Valid
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {documentEntries.map((entry, index) => {
            const doc = entry.doc!;
            const DocIcon = getDocumentIcon(doc.type);
            const colorClass = getDocumentColor(doc.type, doc.valid);
            const fileName = getFileName(doc.url);
            
            return (
              <div key={index} className={`border-2 rounded-lg p-3 transition-all cursor-pointer hover:shadow-md ${colorClass}`}>
                <div className="flex items-center gap-3 mb-2">
                  <DocIcon className="w-4 h-4" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{entry.label}</p>
                    <p className="text-xs opacity-75">
                      {doc.valid ? fileName : `Invalid ${entry.expectedType} Entry`}
                    </p>
                  </div>
                  <Badge variant={doc.valid ? "default" : "destructive"} className="text-xs">
                    {doc.valid ? 'Valid' : 'Invalid'}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDocumentClick(entry)}
                    className="flex items-center gap-1 text-xs h-7"
                  >
                    <Eye className="w-3 h-3" />
                    {doc.type === 'external_url' ? 'Visit' : 'View'}
                  </Button>
                  
                  {doc.type !== 'external_url' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(doc.url, '_blank')}
                      className="flex items-center gap-1 text-xs h-7"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Document Actions */}
          {hasValidDocuments && (
            <div className="flex gap-2 pt-3 border-t">
              <Button
                size="sm"
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => onDocumentAction('all', 'approve')}
              >
                <CheckCircle className="w-3 h-3" />
                Approve All
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => onDocumentAction('all', 'reject')}
              >
                <XCircle className="w-3 h-3" />
                Reject All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewer
          isOpen={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
          document={selectedDocument}
          operatorId={operatorId}
          operatorName={operatorName}
          onDocumentAction={handleDocumentAction}
        />
      )}
    </>
  );
};
