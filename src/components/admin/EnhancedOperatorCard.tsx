
import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, DialogTrigger as AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Eye, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Image, 
  Link, 
  Download, 
  AlertTriangle,
  User,
  Building,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield
} from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { adminService } from '@/services/AdminService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { OperatorDetailView } from './OperatorDetailView';

type Operator = Tables<'operators'>;

interface EnhancedOperatorCardProps {
  operator: Operator;
  onUpdateOperator: (updatedOperator: Operator) => void;
  onDeleteOperator: (operatorId: string) => void;
}

export const EnhancedOperatorCard: React.FC<EnhancedOperatorCardProps> = ({
  operator,
  onUpdateOperator,
  onDeleteOperator
}) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const isValidPdfUrl = (url: string) => {
    return url && (url.includes('.pdf') || (url.includes('supabase') && url.includes('pdf-uploads')));
  };

  const isValidImageUrl = (url: string) => {
    if (!url) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];
    const hasImageExtension = imageExtensions.some(ext => url.toLowerCase().includes(ext));
    const isFromImageStorage = url.includes('supabase') && url.includes('image-uploads');
    return hasImageExtension || isFromImageStorage;
  };

  const isValidUrl = (url: string): boolean => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') && 
             !url.includes('supabase');
    } catch {
      return false;
    }
  };

  const getDocumentType = (url: string, field: string) => {
    if (!url) return 'No Document';
    
    if (field === 'certificate_of_incorporation_url') {
      if (isValidPdfUrl(url)) return 'PDF Document';
      return 'Invalid PDF Entry';
    }
    if (field === 'business_permit_url') {
      if (isValidImageUrl(url)) return 'Image Document';
      return 'Invalid Image Entry';
    }
    if (field === 'kato_membership_url') {
      if (isValidUrl(url)) return 'External URL';
      return 'Invalid URL Entry';
    }
    return 'Unknown Entry';
  };

  const getFileName = (url: string) => {
    if (!url) return 'No File';
    if (url.includes('supabase')) {
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      return lastPart.replace(/^\d+-/, '') || 'Document';
    }
    return url.length > 50 ? url.substring(0, 50) + '...' : url;
  };

  const getDocumentIcon = (url: string, field: string) => {
    const type = getDocumentType(url, field);
    if (type === 'PDF Document') return FileText;
    if (type === 'Image Document') return Image;
    if (type === 'External URL') return Link;
    return XCircle;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const handleToggleStatus = async () => {
    setLoadingStates(prev => ({ ...prev, [operator.id]: true }));
    
    try {
      const response = await adminService.toggleOperatorStatus(operator.id, !operator.is_active);
      if (response.success) {
        onUpdateOperator(response.data);
        toast.success(`Operator ${!operator.is_active ? 'activated' : 'deactivated'} successfully`);
      } else {
        toast.error(response.errors?.[0] || 'Failed to update operator status');
      }
    } catch (error) {
      console.error('Error toggling operator status:', error);
      toast.error('Failed to update operator status');
    } finally {
      setLoadingStates(prev => ({ ...prev, [operator.id]: false }));
    }
  };

  const handleDeleteOperator = async () => {
    if (!window.confirm(`Are you sure you want to delete ${operator.name}? This action cannot be undone.`)) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, [operator.id]: true }));
    
    try {
      const response = await adminService.deleteOperator(operator.id);
      if (response.success) {
        onDeleteOperator(operator.id);
        toast.success('Operator deleted successfully');
      } else {
        toast.error(response.errors?.[0] || 'Failed to delete operator');
      }
    } catch (error) {
      console.error('Error deleting operator:', error);
      toast.error('Failed to delete operator');
    } finally {
      setLoadingStates(prev => ({ ...prev, [operator.id]: false }));
    }
  };

  const handleApproveDocument = async (approved: boolean) => {
    setProcessing(true);
    try {
      const updateData = {
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('operators')
        .update(updateData)
        .eq('id', operator.id)
        .select()
        .single();

      if (error) throw error;

      toast.success(`Proof of Trust ${approved ? 'approved' : 'rejected'} successfully`);
      onUpdateOperator(data);
      setReviewNotes('');
    } catch (error) {
      console.error('Error updating verification status:', error);
      toast.error('Failed to update verification status');
    } finally {
      setProcessing(false);
    }
  };

  // Get proof of trust documents
  const proofOfTrustDocs = [
    { 
      url: operator.certificate_of_incorporation_url, 
      field: 'certificate_of_incorporation_url',
      label: 'Certificate of Incorporation',
      expectedType: 'PDF'
    },
    { 
      url: operator.business_permit_url, 
      field: 'business_permit_url',
      label: 'Business Permit',
      expectedType: 'Image'
    },
    { 
      url: operator.kato_membership_url, 
      field: 'kato_membership_url',
      label: 'KATO Membership',
      expectedType: 'URL'
    }
  ].filter(doc => doc.url && doc.url.length > 0);

  const hasValidDocuments = proofOfTrustDocs.some(doc => {
    const docType = getDocumentType(doc.url, doc.field);
    return docType.includes('Document') || docType === 'External URL';
  });

  const hasAnyDocuments = proofOfTrustDocs.length > 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Building className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                {operator.company_name || operator.company}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={operator.is_active ? "default" : "secondary"}>
                  {operator.is_active ? "Active" : "Inactive"}
                </Badge>
                {hasAnyDocuments && (
                  <Badge variant={hasValidDocuments ? "default" : "destructive"} className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {hasValidDocuments ? "Documents OK" : "Invalid Documents"}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Core Profile Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Contact:</span>
              <span>{operator.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Email:</span>
              <span>{operator.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Phone:</span>
              <span>{operator.contact_person_phone || 'Not provided'}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Location:</span>
              <span>{operator.city || 'Not provided'}, {operator.country}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Joined:</span>
              <span>{formatDate(operator.created_at)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Building className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Registration:</span>
              <span>{operator.registration_number || 'Not provided'}</span>
            </div>
          </div>
        </div>

        {/* Specializations */}
        {operator.specializations && operator.specializations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Specializations</h4>
            <div className="flex flex-wrap gap-1">
              {operator.specializations.map((spec, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {spec}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Proof of Trust Documents */}
        {hasAnyDocuments && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Proof of Trust Documents
            </h4>
            <div className="space-y-3">
              {proofOfTrustDocs.map((doc, index) => {
                const docType = getDocumentType(doc.url, doc.field);
                const fileName = getFileName(doc.url);
                const DocIcon = getDocumentIcon(doc.url, doc.field);
                const isUploadedFile = doc.url.includes('supabase');
                const isValidEntry = docType.includes('Document') || docType === 'External URL';
                
                return (
                  <div key={index} className={`border rounded-lg p-3 ${
                    isValidEntry 
                      ? docType === 'PDF Document' 
                        ? 'bg-blue-50 border-blue-200' 
                        : docType === 'Image Document'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-purple-50 border-purple-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <DocIcon className={`w-4 h-4 ${
                        isValidEntry 
                          ? docType === 'PDF Document' 
                            ? 'text-blue-600' 
                            : docType === 'Image Document'
                            ? 'text-green-600'
                            : 'text-purple-600'
                          : 'text-red-600'
                      }`} />
                      <div className="flex-1">
                        <p className={`font-medium text-xs ${
                          isValidEntry 
                            ? docType === 'PDF Document' 
                              ? 'text-blue-900' 
                              : docType === 'Image Document'
                              ? 'text-green-900'
                              : 'text-purple-900'
                            : 'text-red-900'
                        }`}>
                          {doc.label}
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
                          {isValidEntry ? fileName : `Invalid ${doc.expectedType} Entry`}
                        </p>
                      </div>
                    </div>
                    
                    {isValidEntry ? (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(doc.url, '_blank', 'noopener,noreferrer')}
                          className="flex items-center gap-1 text-xs h-7"
                        >
                          <Eye className="w-3 h-3" />
                          {docType === 'External URL' ? 'Visit' : 'View'}
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
                            className="flex items-center gap-1 text-xs h-7"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                        <span className="text-xs text-red-600">
                          Invalid format - Expected {doc.expectedType.toLowerCase()}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Document Actions */}
            {hasValidDocuments && (
              <div className="flex gap-2 mt-4 pt-3 border-t">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-xs"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approve Documents
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Approve Proof of Trust</DialogTitle>
                      <DialogDescription>
                        Approve the proof of trust materials for {operator.company_name || operator.company}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
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
                          onClick={() => handleApproveDocument(true)}
                          disabled={processing}
                          className="bg-green-600 hover:bg-green-700"
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
                    <Button variant="destructive" size="sm" className="text-xs">
                      <XCircle className="w-3 h-3 mr-1" />
                      Reject Documents
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reject Proof of Trust</AlertDialogTitle>
                      <AlertDialogDescription>
                        Reject the proof of trust materials for {operator.company_name || operator.company}
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
                        onClick={() => handleApproveDocument(false)}
                        disabled={processing || !reviewNotes.trim()}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {processing ? 'Processing...' : 'Reject'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Operator Details</DialogTitle>
                <DialogDescription>
                  View and edit operator profile information
                </DialogDescription>
              </DialogHeader>
              <OperatorDetailView 
                operator={operator} 
                onUpdate={onUpdateOperator}
              />
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline" 
            size="sm"
            onClick={handleToggleStatus}
            disabled={loadingStates[operator.id]}
          >
            {loadingStates[operator.id] 
              ? 'Updating...' 
              : operator.is_active ? "Deactivate" : "Activate"
            }
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDeleteOperator}
            disabled={loadingStates[operator.id]}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
