
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentVerificationStatus } from "@/components/admin/DocumentVerificationStatus";
import { Shield } from 'lucide-react';
import { OperatorProfile } from '@/types/operator';

interface ProofOfTrustSectionProps {
  profile: OperatorProfile;
}

export const ProofOfTrustSection: React.FC<ProofOfTrustSectionProps> = ({ profile }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Proof of Trust
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DocumentVerificationStatus
          status={profile.document_verification_status || 'pending'}
          verifiedAt={profile.document_verified_at}
          verificationNotes={profile.document_verification_notes}
        />
      </CardContent>
    </Card>
  );
};
