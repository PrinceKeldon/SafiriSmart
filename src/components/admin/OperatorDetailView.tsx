
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, ExternalLink, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface OperatorDetailViewProps {
  operator: {
    id: string;
    name: string;
    email: string;
    company: string;
    company_name?: string;
    registration_number?: string;
    address?: string;
    city?: string;
    country?: string;
    contact_person_name?: string;
    contact_person_phone?: string;
    website_url?: string;
    description?: string;
    certificate_of_incorporation_url?: string;
    business_permit_url?: string;
    kato_membership_url?: string;
    role: string;
    specializations: string[];
    is_active: boolean;
    created_at: string;
  };
  onUpdate?: (updatedOperator: any) => void;
}

export const OperatorDetailView: React.FC<OperatorDetailViewProps> = ({ 
  operator, 
  onUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editedOperator, setEditedOperator] = useState(operator);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Operator profile updated successfully');
      onUpdate?.(editedOperator);
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update operator profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedOperator(operator);
    setIsEditing(false);
  };

  const DocumentLink: React.FC<{ label: string; url?: string }> = ({ label, url }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {url ? (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(url, '_blank')}
            className="flex items-center space-x-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Document</span>
          </Button>
        </div>
      ) : (
        <p className="text-sm text-gray-500">No document uploaded</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{operator.name}</h2>
          <p className="text-gray-600">{operator.email}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={operator.is_active ? "default" : "secondary"}>
            {operator.is_active ? "Active" : "Inactive"}
          </Badge>
          <Badge variant="outline">{operator.role}</Badge>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button 
                onClick={handleSave} 
                disabled={isLoading}
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
              <Button 
                onClick={handleCancel} 
                variant="outline"
                size="sm"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Full Name</Label>
              {isEditing ? (
                <Input
                  value={editedOperator.name}
                  onChange={(e) => setEditedOperator({ ...editedOperator, name: e.target.value })}
                />
              ) : (
                <p className="text-sm mt-1">{operator.name}</p>
              )}
            </div>
            
            <div>
              <Label>Email Address</Label>
              {isEditing ? (
                <Input
                  type="email"
                  value={editedOperator.email}
                  onChange={(e) => setEditedOperator({ ...editedOperator, email: e.target.value })}
                />
              ) : (
                <p className="text-sm mt-1">{operator.email}</p>
              )}
            </div>
            
            <div>
              <Label>Company</Label>
              {isEditing ? (
                <Input
                  value={editedOperator.company}
                  onChange={(e) => setEditedOperator({ ...editedOperator, company: e.target.value })}
                />
              ) : (
                <p className="text-sm mt-1">{operator.company}</p>
              )}
            </div>

            <div>
              <Label>Status</Label>
              {isEditing ? (
                <Select
                  value={editedOperator.is_active ? "active" : "inactive"}
                  onValueChange={(value) => setEditedOperator({ ...editedOperator, is_active: value === "active" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm mt-1">{operator.is_active ? "Active" : "Inactive"}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Company Details */}
        <Card>
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Company Name</Label>
              {isEditing ? (
                <Input
                  value={editedOperator.company_name || ''}
                  onChange={(e) => setEditedOperator({ ...editedOperator, company_name: e.target.value })}
                  placeholder="Enter company name"
                />
              ) : (
                <p className="text-sm mt-1">{operator.company_name || 'Not provided'}</p>
              )}
            </div>
            
            <div>
              <Label>Registration Number</Label>
              {isEditing ? (
                <Input
                  value={editedOperator.registration_number || ''}
                  onChange={(e) => setEditedOperator({ ...editedOperator, registration_number: e.target.value })}
                  placeholder="Enter registration number"
                />
              ) : (
                <p className="text-sm mt-1">{operator.registration_number || 'Not provided'}</p>
              )}
            </div>
            
            <div>
              <Label>Website</Label>
              {isEditing ? (
                <Input
                  value={editedOperator.website_url || ''}
                  onChange={(e) => setEditedOperator({ ...editedOperator, website_url: e.target.value })}
                  placeholder="https://www.example.com"
                />
              ) : (
                <p className="text-sm mt-1">
                  {operator.website_url ? (
                    <a href={operator.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {operator.website_url}
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </p>
              )}
            </div>
            
            <div>
              <Label>Description</Label>
              {isEditing ? (
                <Textarea
                  value={editedOperator.description || ''}
                  onChange={(e) => setEditedOperator({ ...editedOperator, description: e.target.value })}
                  placeholder="Company description..."
                  rows={3}
                />
              ) : (
                <p className="text-sm mt-1">{operator.description || 'Not provided'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Address</Label>
              {isEditing ? (
                <Textarea
                  value={editedOperator.address || ''}
                  onChange={(e) => setEditedOperator({ ...editedOperator, address: e.target.value })}
                  placeholder="Enter address"
                  rows={2}
                />
              ) : (
                <p className="text-sm mt-1">{operator.address || 'Not provided'}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                {isEditing ? (
                  <Input
                    value={editedOperator.city || ''}
                    onChange={(e) => setEditedOperator({ ...editedOperator, city: e.target.value })}
                    placeholder="Enter city"
                  />
                ) : (
                  <p className="text-sm mt-1">{operator.city || 'Not provided'}</p>
                )}
              </div>
              
              <div>
                <Label>Country</Label>
                {isEditing ? (
                  <Select
                    value={editedOperator.country || 'Kenya'}
                    onValueChange={(value) => setEditedOperator({ ...editedOperator, country: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kenya">Kenya</SelectItem>
                      <SelectItem value="Tanzania">Tanzania</SelectItem>
                      <SelectItem value="Uganda">Uganda</SelectItem>
                      <SelectItem value="Rwanda">Rwanda</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm mt-1">{operator.country || 'Not provided'}</p>
                )}
              </div>
            </div>
            
            <div>
              <Label>Contact Person</Label>
              {isEditing ? (
                <Input
                  value={editedOperator.contact_person_name || ''}
                  onChange={(e) => setEditedOperator({ ...editedOperator, contact_person_name: e.target.value })}
                  placeholder="Enter contact person name"
                />
              ) : (
                <p className="text-sm mt-1">{operator.contact_person_name || 'Not provided'}</p>
              )}
            </div>
            
            <div>
              <Label>Contact Phone</Label>
              {isEditing ? (
                <Input
                  value={editedOperator.contact_person_phone || ''}
                  onChange={(e) => setEditedOperator({ ...editedOperator, contact_person_phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              ) : (
                <p className="text-sm mt-1">{operator.contact_person_phone || 'Not provided'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Compliance Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DocumentLink 
              label="Certificate of Incorporation" 
              url={operator.certificate_of_incorporation_url} 
            />
            <DocumentLink 
              label="Business Permit" 
              url={operator.business_permit_url} 
            />
            <DocumentLink 
              label="KATO Membership" 
              url={operator.kato_membership_url} 
            />
          </CardContent>
        </Card>
      </div>

      {/* Specializations */}
      <Card>
        <CardHeader>
          <CardTitle>Specializations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {operator.specializations.map((spec, index) => (
              <Badge key={index} variant="outline">
                {spec}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
