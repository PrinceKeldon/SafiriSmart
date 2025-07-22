
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Building, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Link as LinkIcon,
  Settings,
  Power,
  PowerOff,
  Trash2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { adminService } from '@/services/AdminService';
import { toast } from 'sonner';
import { OperatorDetailView } from './OperatorDetailView';
import { OperatorStatusBadge } from './OperatorStatusBadge';
import { ProofOfTrustCard } from './ProofOfTrustCard';

type Operator = Tables<'operators'>;

interface OperatorWithDocuments extends Operator {
  documents?: {
    certificate_of_incorporation?: { url: string; valid: boolean; type: string };
    business_permit?: { url: string; valid: boolean; type: string };
    kato_membership?: { url: string; valid: boolean; type: string };
  };
}

interface NewOperatorCardProps {
  operator: OperatorWithDocuments;
  onUpdateOperator: (updatedOperator: Operator) => void;
  onDeleteOperator: (operatorId: string) => void;
}

export const NewOperatorCard: React.FC<NewOperatorCardProps> = ({
  operator,
  onUpdateOperator,
  onDeleteOperator
}) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
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

  // Document status calculation
  const documentEntries = operator.documents ? Object.values(operator.documents).filter(doc => doc) : [];
  const validDocuments = documentEntries.filter(doc => doc?.valid);
  const documentStatus = {
    hasDocuments: documentEntries.length > 0,
    validDocuments: validDocuments.length,
    totalDocuments: documentEntries.length
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

  const handleDocumentAction = async (documentType: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      let response;
      if (action === 'approve') {
        response = await adminService.approveOperatorDocuments(operator.id, notes);
      } else {
        response = await adminService.rejectOperatorDocuments(operator.id, notes || 'Document rejected');
      }
      
      if (response.success) {
        onUpdateOperator(response.data);
        toast.success(`Documents ${action}ed successfully`);
      } else {
        toast.error(response.errors?.[0] || `Failed to ${action} documents`);
      }
    } catch (error) {
      console.error(`Error ${action}ing documents:`, error);
      toast.error(`Failed to ${action} documents`);
    }
  };

  // Fix the type casting for verification status
  const verificationStatus = (operator.document_verification_status || 'pending') as 'pending' | 'under_review' | 'approved' | 'rejected';

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary/50">
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
              <div className="mb-3">
                <OperatorStatusBadge
                  isActive={operator.is_active}
                  profileCompletion={profileCompletionPercentage}
                  documentStatus={documentStatus}
                  verificationStatus={verificationStatus}
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{operator.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  <span>{operator.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span>{operator.contact_person_phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{operator.city || 'Unknown'}, {operator.country}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(operator.created_at)}</span>
                </div>
                {operator.website_url && (
                  <div className="flex items-center gap-1">
                    <LinkIcon className="w-4 h-4" />
                    <a 
                      href={operator.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      Website <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Company Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Registration:</span>
              <span className="ml-2">{operator.registration_number || 'Not provided'}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium">Address:</span>
              <span className="ml-2">{operator.address || 'Not provided'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Role:</span>
              <Badge variant="outline" className="ml-2">
                {operator.role}
              </Badge>
            </div>
            <div className="text-sm">
              <span className="font-medium">Status:</span>
              <Badge variant={operator.is_active ? "default" : "secondary"} className="ml-2">
                {operator.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>

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
        {operator.documents && (
          <ProofOfTrustCard
            documents={operator.documents}
            operatorId={operator.id}
            operatorName={operator.company_name || operator.company}
            verificationStatus={verificationStatus}
            verificationNotes={operator.document_verification_notes || undefined}
            onDocumentAction={handleDocumentAction}
          />
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

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                disabled={loadingStates[operator.id]}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 font-medium"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the operator 
                  "{operator.company_name || operator.company}" and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteOperator}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete Operator
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};
