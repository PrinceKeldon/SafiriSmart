
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface CreateOperatorDialogProps {
  onCreateOperator: (operator: any) => void;
}

export const CreateOperatorDialog: React.FC<CreateOperatorDialogProps> = ({ 
  onCreateOperator 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [newOperator, setNewOperator] = useState({
    name: '',
    email: '',
    company: '',
    specializations: ''
  });

  const handleCreateOperator = async () => {
    setIsLoading(true);
    
    try {
      const operatorData = {
        name: newOperator.name,
        email: newOperator.email,
        company: newOperator.company,
        specializations: newOperator.specializations.split(',').map(s => s.trim()),
      };
      
      await onCreateOperator(operatorData);
      setNewOperator({ name: '', email: '', company: '', specializations: '' });
      
    } catch (error) {
      toast.error('Failed to create operator');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Operator
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Operator</DialogTitle>
          <DialogDescription>Create a new tour operator account</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={newOperator.name}
              onChange={(e) => setNewOperator({ ...newOperator, name: e.target.value })}
              placeholder="Enter operator's full name"
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={newOperator.email}
              onChange={(e) => setNewOperator({ ...newOperator, email: e.target.value })}
              placeholder="Enter email address"
            />
          </div>
          
          <div>
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              value={newOperator.company}
              onChange={(e) => setNewOperator({ ...newOperator, company: e.target.value })}
              placeholder="Enter company name"
            />
          </div>
          
          <div>
            <Label htmlFor="specializations">Specializations</Label>
            <Textarea
              id="specializations"
              value={newOperator.specializations}
              onChange={(e) => setNewOperator({ ...newOperator, specializations: e.target.value })}
              placeholder="e.g., Safari Tours, Mountain Climbing (comma-separated)"
              rows={3}
            />
          </div>
          
          <Button 
            onClick={handleCreateOperator} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Creating...' : 'Create Operator'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
