
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { 
  Power, 
  PowerOff, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  Shield,
  Percent
} from 'lucide-react';

interface OperatorStatusBadgeProps {
  isActive: boolean;
  profileCompletion: number;
  documentStatus: {
    hasDocuments: boolean;
    validDocuments: number;
    totalDocuments: number;
  };
  verificationStatus?: 'pending' | 'approved' | 'rejected';
}

export const OperatorStatusBadge: React.FC<OperatorStatusBadgeProps> = ({
  isActive,
  profileCompletion,
  documentStatus,
  verificationStatus = 'pending'
}) => {
  const getProfileCompletionColor = () => {
    if (profileCompletion >= 80) return 'bg-green-50 text-green-700 border-green-200';
    if (profileCompletion >= 50) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  const getDocumentStatusColor = () => {
    if (!documentStatus.hasDocuments) return 'bg-gray-100 text-gray-600 border-gray-200';
    if (documentStatus.validDocuments === documentStatus.totalDocuments) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getVerificationStatusColor = () => {
    switch (verificationStatus) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Active Status */}
      <Badge 
        variant={isActive ? "default" : "secondary"}
        className={`flex items-center gap-1 ${
          isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'
        }`}
      >
        {isActive ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
        {isActive ? "Active" : "Inactive"}
      </Badge>

      {/* Profile Completion */}
      <Badge 
        variant="outline" 
        className={`flex items-center gap-1 ${getProfileCompletionColor()}`}
      >
        <Percent className="w-3 h-3" />
        Profile {profileCompletion}%
      </Badge>

      {/* Document Status */}
      <Badge 
        variant="outline" 
        className={`flex items-center gap-1 ${getDocumentStatusColor()}`}
      >
        <Shield className="w-3 h-3" />
        {!documentStatus.hasDocuments ? (
          "No Documents"
        ) : (
          `${documentStatus.validDocuments}/${documentStatus.totalDocuments} Valid`
        )}
      </Badge>

      {/* Verification Status */}
      <Badge 
        variant="outline" 
        className={`flex items-center gap-1 ${getVerificationStatusColor()}`}
      >
        {verificationStatus === 'approved' && <CheckCircle className="w-3 h-3" />}
        {verificationStatus === 'rejected' && <XCircle className="w-3 h-3" />}
        {verificationStatus === 'pending' && <Clock className="w-3 h-3" />}
        {verificationStatus === 'approved' ? 'Verified' : 
         verificationStatus === 'rejected' ? 'Rejected' : 'Pending Review'}
      </Badge>
    </div>
  );
};
