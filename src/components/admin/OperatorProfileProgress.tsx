import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type OperatorRow = Tables<'operators'>;

interface OperatorProfileProgressProps {
  operator: OperatorRow;
  compact?: boolean;
}

interface ProfileTask {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export const OperatorProfileProgress: React.FC<OperatorProfileProgressProps> = ({ 
  operator, 
  compact = false 
}) => {
  const getProfileTasks = (): ProfileTask[] => {
    const tasks: ProfileTask[] = [];

    // Company Information
    const companyFields = [
      operator.company_name,
      operator.registration_number,
      operator.description
    ];
    const companyComplete = companyFields.every(field => field && field.length > 0);
    
    tasks.push({
      id: 'company-info',
      title: 'Company Information',
      completed: companyComplete,
      priority: 'high'
    });

    // Contact Information
    const contactFields = [
      operator.address,
      operator.city,
      operator.contact_person_name,
      operator.contact_person_phone
    ];
    const contactComplete = contactFields.every(field => field && field.length > 0);
    
    tasks.push({
      id: 'contact-info',
      title: 'Contact Information',
      completed: contactComplete,
      priority: 'high'
    });

    // Services & Destinations
    const servicesComplete = (Array.isArray(operator.services_offered) && operator.services_offered.length > 0) && 
                            (Array.isArray(operator.destinations_covered) && operator.destinations_covered.length > 0);
    
    tasks.push({
      id: 'services-destinations',
      title: 'Services & Destinations',
      completed: servicesComplete,
      priority: 'medium'
    });

    // Documents
    const documents = [
      operator.certificate_of_incorporation_url,
      operator.business_permit_url,
      operator.kato_membership_url
    ];
    const documentsComplete = documents.filter(doc => doc && doc.length > 0).length;
    
    tasks.push({
      id: 'documents',
      title: 'Compliance Documents',
      completed: documentsComplete >= 2, // At least 2 out of 3 documents
      priority: 'medium'
    });

    return tasks;
  };

  const tasks = getProfileTasks();
  const completedTasks = tasks.filter(task => task.completed);
  const progressPercentage = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
  
  const getProgressStatus = () => {
    if (progressPercentage === 100) return { color: 'text-green-600', icon: CheckCircle, label: 'Complete' };
    if (progressPercentage >= 50) return { color: 'text-yellow-600', icon: Clock, label: 'In Progress' };
    return { color: 'text-red-600', icon: AlertCircle, label: 'Incomplete' };
  };

  const status = getProgressStatus();
  const StatusIcon = status.icon;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <StatusIcon className={`w-4 h-4 ${status.color}`} />
        <div className="flex-1 min-w-0">
          <Progress value={progressPercentage} className="h-2" />
        </div>
        <span className="text-xs text-muted-foreground">
          {completedTasks.length}/{tasks.length}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-4 h-4 ${status.color}`} />
          <span className="text-sm font-medium">Profile Completion</span>
        </div>
        <Badge variant={progressPercentage === 100 ? 'default' : 'secondary'}>
          {status.label}
        </Badge>
      </div>
      
      <Progress value={progressPercentage} className="h-2" />
      
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{completedTasks.length} of {tasks.length} sections completed</span>
        <span>{Math.round(progressPercentage)}%</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-1">
            {task.completed ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : (
              <AlertCircle className="w-3 h-3 text-red-500" />
            )}
            <span className={task.completed ? 'text-green-700' : 'text-red-700'}>
              {task.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};