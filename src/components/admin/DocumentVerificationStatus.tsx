
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye
} from 'lucide-react';

interface DocumentVerificationStatusProps {
  status: string | null;
  verifiedAt?: string | null;
  verificationNotes?: string | null;
  className?: string;
}

export const DocumentVerificationStatus: React.FC<DocumentVerificationStatusProps> = ({
  status,
  verifiedAt,
  verificationNotes,
  className = ""
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          label: 'Approved',
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 border-green-200',
          message: 'Your documents have been approved!'
        };
      case 'rejected':
        return {
          label: 'Rejected',
          icon: XCircle,
          className: 'bg-red-100 text-red-800 border-red-200',
          message: verificationNotes || 'Your documents have been rejected. Please review and resubmit.'
        };
      case 'under_review':
        return {
          label: 'Under Review',
          icon: Eye,
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          message: 'Your documents are being reviewed by our admin team'
        };
      default:
        return {
          label: 'Pending Review',
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          message: 'Upload your documents for verification'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const Icon = statusConfig.icon;

  return (
    <div className={`space-y-2 ${className}`}>
      <Badge 
        variant="outline" 
        className={`flex items-center gap-1 ${statusConfig.className}`}
      >
        <Icon className="w-3 h-3" />
        {statusConfig.label}
      </Badge>
      
      <p className="text-sm text-gray-600">
        {statusConfig.message}
      </p>
      
      {verifiedAt && (
        <p className="text-xs text-gray-500">
          Last updated: {new Date(verifiedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};
