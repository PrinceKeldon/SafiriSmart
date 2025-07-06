
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const createOperatorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().min(1, 'Company name is required'),
  specializations: z.string().optional(),
  role: z.enum(['operator', 'admin']).default('operator'),
});

type CreateOperatorFormData = z.infer<typeof createOperatorSchema>;

interface CreateOperatorDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCreateOperator: (operator: any) => Promise<void>;
}

export const CreateOperatorDialog: React.FC<CreateOperatorDialogProps> = ({ 
  open,
  onOpenChange,
  onCreateOperator 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateOperatorFormData>({
    resolver: zodResolver(createOperatorSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      specializations: '',
      role: 'operator',
    },
  });

  const handleCreateOperator = async (data: CreateOperatorFormData) => {
    setIsLoading(true);
    
    try {
      const operatorData = {
        name: data.name,
        email: data.email,
        company: data.company,
        specializations: data.specializations ? data.specializations.split(',').map(s => s.trim()).filter(s => s) : [],
        role: data.role,
      };
      
      await onCreateOperator(operatorData);
      
      // Reset form and close dialog on success
      form.reset();
      if (onOpenChange) {
        onOpenChange(false);
      }
      
    } catch (error) {
      console.error('Failed to create operator:', error);
      // Error handling is done by the parent component
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Operator
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Operator</DialogTitle>
          <DialogDescription>
            Create a new tour operator account. A temporary password will be generated automatically.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateOperator)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter operator's full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="operator">Operator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="specializations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specializations</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Safari Tours, Mountain Climbing (comma-separated)"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Creating...' : 'Create Operator'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
