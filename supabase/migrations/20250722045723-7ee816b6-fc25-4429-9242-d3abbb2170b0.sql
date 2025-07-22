
-- Add verification status and notes columns to operators table
ALTER TABLE operators 
ADD COLUMN document_verification_status VARCHAR DEFAULT 'pending',
ADD COLUMN document_verification_notes TEXT,
ADD COLUMN document_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN document_verified_by UUID REFERENCES operators(id);

-- Create index for better query performance
CREATE INDEX idx_operators_verification_status ON operators(document_verification_status);

-- Add constraint to ensure valid verification statuses
ALTER TABLE operators 
ADD CONSTRAINT check_verification_status 
CHECK (document_verification_status IN ('pending', 'under_review', 'approved', 'rejected'));
