
import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
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
  Shield,
  Settings,
  Power,
  PowerOff,
  ExternalLink,
  Percent
} from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { adminService } from '@/services/AdminService';
import { toast } from 'sonner';
import { OperatorDetailView } from './OperatorDetailView';

type Operator = Tables<'operators'>;

interface OperatorWithDocuments extends Operator {
  documents?: {
    certificate_of_incorporation?: { url: string; valid: boolean; type: string };
    business_permit?: { url: string; valid: boolean; type: string };
    kato_membership?: { url: string; valid: boolean; type: string };
  };
}

interface ComprehensiveOperatorCardProps {
  operator: OperatorWithDocuments;
  onUpdateOperator: (updatedOperator: Operator) => void;
  onDeleteOperator: (operatorId: string) => void;
}

export const ComprehensiveOperatorCard: React.FC<ComprehensiveOperatorCardProps> = ({
  operator,
  onUpdateOperator,
  onDeleteOperator
}) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'pdf': return FileText;
      case 'image': return Image;
      case 'external_url': return ExternalLink;
      default: return XCircle;
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

  const handleViewDocument = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadDocument = async (url: string) => {
    try {
      await adminService.downloadDocument(url);
      toast.success('Document downloaded successfully');
    } catch (error) {
      toast.error('Failed to download document');
    }
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

  const handleApproveDocuments = async () => {
    setProcessing(true);
    try {
      const response = await adminService.approveOperatorDocuments(operator.id, reviewNotes);
      if (response.success) {
        onUpdateOperator(response.data);
        toast.success('Documents approved successfully');
        setReviewNotes('');
      } else {
        toast.error(response.errors?.[0] || 'Failed to approve documents');
      }
    } catch (error) {
      console.error('Error approving documents:', error);
      toast.error('Failed to approve documents');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectDocuments = async () => {
    if (!reviewNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    try {
      const response = await adminService.rejectOperatorDocuments(operator.id, reviewNotes);
      if (response.success) {
        onUpdateOperator(response.data);
        toast.success('Documents rejected successfully');
        setReviewNotes('');
      } else {
        toast.error(response.errors?.[0] || 'Failed to reject documents');
      }
    } catch (error) {
      console.error('Error rejecting documents:', error);
      toast.error('Failed to reject documents');
    } finally {
      setProcessing(false);
    }
  };

  // Calculate profile completion
  const profileFields = [
    operator.company_name || operator.company,
    operator.email,
    operator.name,
    operator.contact_person_phone,
    operator.city,
    operator.country,
    operator.registration_number,
    operator.address,
    operator.website_url,
    operator.description
  ];
  
  const completedFields = profileFields.filter(field => field && field.length > 0).length;
  const profileCompletionPercentage = Math.round((completedFields / profileFields.length) * 100);

  // Get valid documents
  const validDocuments = operator.documents ? Object.values(operator.documents).filter(doc => doc && doc.valid) : [];
  const totalDocuments = operator.documents ? Object.keys(operator.documents).length : 0;
  const hasValidDocuments = validDocuments.length > 0;

  const documentEntries = [
    { 
      key: 'certificate_of_incorporation',
      label: 'Certificate of Incorporation',
      doc: operator.documents?.certificate_of_incorporation,
      expectedType: 'PDF'
    },
    { 
      key: 'business_permit',
      label: 'Business Permit',
      doc: operator.documents?.business_permit,
      expectedType: 'Image'
    },
    { 
      key: 'kato_membership',
      label: 'KATO Membership',
      doc: operator.documents?.kato_membership,
      expectedType: 'URL'
    }
  ].filter(entry => entry.doc);

  return (
    <Card className="w-full border-l-4 border-l-primary/20 hover:border-l-primary/50 transition-all duration-200 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Building className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                {operator.company_name || operator.company}
              </CardTitle>
              
              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge 
                  variant={operator.is_active ? "default" : "secondary"}
                  className={`flex items-center gap-1 ${
                    operator.is_active ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  {operator.is_active ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
                  {operator.is_active ? "Active" : "Inactive"}
                </Badge>
                
                <Badge 
                  variant="outline" 
                  className={`flex items-center gap-1 ${
                    profileCompletionPercentage >= 80 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : profileCompletionPercentage >= 50 
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  <Percent className="w-3 h-3" />
                  Profile {profileCompletionPercentage}%
                </Badge>

                {documentEntries.length > 0 && (
                  <Badge 
                    variant={hasValidDocuments ? "default" : "destructive"} 
                    className={`flex items-center gap-1 ${
                      hasValidDocuments 
                        ? 'bg-blue-100 text-blue-800 border-blue-200' 
                        : 'bg-red-100 text-red-800 border-red-200'
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    {validDocuments.length}/{totalDocuments} Valid Documents
                  </Badge>
                )}
              </div>

              {/* Contact Information */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{operator.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  <span>{operator.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{operator.city || 'Unknown'}, {operator.country}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(operator.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Core Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Phone:</span>
              <span>{operator.contact_person_phone || 'Not provided'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Building className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Registration:</span>
              <span>{operator.registration_number || 'Not provided'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Link className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Website:</span>
              <span>{operator.website_url || 'Not provided'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Address:</span>
              <span>{operator.address || 'Not provided'}</span>
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
        {documentEntries.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Proof of Trust Documents
              <Badge variant="outline" className="text-xs">
                {documentEntries.length} document{documentEntries.length > 1 ? 's' : ''} submitted
              </Badge>
            </h4>
            <div className="space-y-3">
              {documentEntries.map((entry, index) => {
                const doc = entry.doc!;
                const DocIcon = getDocumentIcon(doc.type);
                const colorClass = getDocumentColor(doc.type, doc.valid);
                const fileName = getFileName(doc.url);
                
                return (
                  <div key={index} className={`border-2 rounded-lg p-4 transition-all ${colorClass}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <DocIcon className={`w-5 h-5 ${doc.valid ? 'text-current' : 'text-red-600'}`} />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">
                          {entry.label}
                        </p>
                        <p className="text-xs">
                          {doc.valid ? fileName : `Invalid ${entry.expectedType} Entry`}
                        </p>
                      </div>
                      
                      <Badge 
                        variant={doc.valid ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {doc.valid ? 'Valid' : 'Invalid'}
                      </Badge>
                    </div>
                    
                    {doc.valid ? (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDocument(doc.url)}
                          className="flex items-center gap-1 text-xs h-8"
                        >
                          <Eye className="w-3 h-3" />
                          {doc.type === 'external_url' ? 'Visit' : 'View'}
                        </Button>
                        {doc.type !== 'external_url' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadDocument(doc.url)}
                            className="flex items-center gap-1 text-xs h-8"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-600 font-medium">
                          Invalid format - Expected {entry.expectedType.toLowerCase()}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Document Review Actions */}
            {hasValidDocuments && (
              <div className="flex gap-3 mt-4 pt-3 border-t">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white font-medium"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve Documents
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Approve Documents</DialogTitle>
                      <DialogDescription>
                        Approve the proof of trust documents for {operator.company_name || operator.company}
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
                          onClick={handleApproveDocuments}
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
                    <Button variant="destructive" size="sm" className="font-medium">
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject Documents
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reject Documents</AlertDialogTitle>
                      <AlertDialogDescription>
                        Reject the proof of trust documents for {operator.company_name || operator.company}
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
                        onClick={handleRejectDocuments}
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
        <div className="flex flex-wrap gap-3 pt-4 border-t bg-gray-50 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className="font-medium bg-blue-600 hover:bg-blue-700">
                <Settings className="h-4 w-4 mr-1" />
                Manage Operator
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Operator Management</DialogTitle>
                <DialogDescription>
                  View and edit detailed operator profile information
                </DialogDescription>
              </DialogHeader>
              <OperatorDetailView 
                operator={operator} 
                onUpdate={onUpdateOperator}
              />
            </DialogContent>
          </Dialog>

          <Button 
            variant={operator.is_active ? "outline" : "default"} 
            size="sm"
            onClick={handleToggleStatus}
            disabled={loadingStates[operator.id]}
            className={`font-medium ${
              operator.is_active 
                ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {loadingStates[operator.id] ? (
              <Clock className="h-4 w-4 mr-1 animate-spin" />
            ) : operator.is_active ? (
              <PowerOff className="h-4 w-4 mr-1" />
            ) : (
              <Power className="h-4 w-4 mr-1" />
            )}
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
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 font-medium"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
