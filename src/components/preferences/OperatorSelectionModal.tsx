
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, MapPin, Clock, Users, DollarSign, CheckCircle } from 'lucide-react';
import { b2cApiService } from '@/services/B2CApiService';
import { useToast } from '@/hooks/use-toast';

interface Operator {
  id: string;
  company_name: string;
  description: string;
  specializations: string[];
  top_packages: {
    id: string;
    package_name: string;
    description: string;
    budget_tier: string;
    min_duration: number;
    max_duration: number;
    estimated_cost_per_person_per_day: number;
  }[];
}

interface OperatorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOperatorsSelected: (selectedOperatorIds: string[]) => void;
  travelerData: {
    traveler: any;
    preferences: any;
    schedule: any;
    travel: any;
    dietary: any;
    itinerary: any;
  };
}

export const OperatorSelectionModal: React.FC<OperatorSelectionModalProps> = ({
  isOpen,
  onClose,
  onOperatorsSelected,
  travelerData
}) => {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperators, setSelectedOperators] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchOperators();
    }
  }, [isOpen]);

  const fetchOperators = async () => {
    setLoading(true);
    try {
      const operatorsList = await b2cApiService.getPublicOperators();
      setOperators(operatorsList);
    } catch (error) {
      console.error('Error fetching operators:', error);
      toast({
        title: "Error",
        description: "Failed to load operators. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOperatorToggle = (operatorId: string) => {
    const newSelected = new Set(selectedOperators);
    if (newSelected.has(operatorId)) {
      newSelected.delete(operatorId);
    } else {
      newSelected.add(operatorId);
    }
    setSelectedOperators(newSelected);
  };

  const handleSendInquiry = async () => {
    if (selectedOperators.size === 0) {
      toast({
        title: "No Operators Selected",
        description: "Please select at least one operator to send your inquiry to.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      await b2cApiService.createLeadWithSelectedOperators({
        ...travelerData,
        selectedOperatorIds: Array.from(selectedOperators)
      });

      toast({
        title: "Inquiry Sent Successfully!",
        description: `Your safari inquiry has been sent to ${selectedOperators.size} operator${selectedOperators.size > 1 ? 's' : ''}. They will contact you soon with personalized quotes.`,
      });

      onOperatorsSelected(Array.from(selectedOperators));
    } catch (error) {
      console.error('Error sending inquiry:', error);
      toast({
        title: "Error",
        description: "Failed to send inquiry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Select Safari Operators</DialogTitle>
          <DialogDescription>
            Choose one or more safari operators to receive your personalized itinerary and get custom quotes.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Loading safari operators...</span>
          </div>
        ) : (
          <>
            <div className="grid gap-4 max-h-96 overflow-y-auto">
              {operators.map((operator) => (
                <Card key={operator.id} className={`cursor-pointer transition-all ${
                  selectedOperators.has(operator.id) ? 'ring-2 ring-green-500 bg-green-50' : 'hover:shadow-md'
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{operator.company_name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{operator.description}</p>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {operator.specializations.map((spec) => (
                            <Badge key={spec} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {selectedOperators.has(operator.id) && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                        <Checkbox
                          checked={selectedOperators.has(operator.id)}
                          onCheckedChange={() => handleOperatorToggle(operator.id)}
                          className="h-5 w-5"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  
                  {operator.top_packages.length > 0 && (
                    <CardContent className="pt-0">
                      <h4 className="font-medium text-sm mb-2">Popular Packages:</h4>
                      <div className="space-y-2">
                        {operator.top_packages.slice(0, 3).map((pkg) => (
                          <div key={pkg.id} className="text-xs bg-gray-50 p-2 rounded">
                            <div className="font-medium">{pkg.package_name}</div>
                            <div className="flex items-center gap-4 mt-1 text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {pkg.min_duration}-{pkg.max_duration} days
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                ${pkg.estimated_cost_per_person_per_day}/day
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {pkg.budget_tier}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                {selectedOperators.size} operator{selectedOperators.size !== 1 ? 's' : ''} selected
              </p>
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} disabled={submitting}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendInquiry} 
                  disabled={selectedOperators.size === 0 || submitting}
                  className="min-w-[200px]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending Inquiry...
                    </>
                  ) : (
                    `Send Inquiry to ${selectedOperators.size} Operator${selectedOperators.size !== 1 ? 's' : ''}`
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
