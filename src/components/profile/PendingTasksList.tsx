import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type OperatorRow = Tables<'operators'>;

interface PendingTasksListProps {
  profile: OperatorRow | undefined;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'incomplete';
  priority: 'high' | 'medium' | 'low';
}

export const PendingTasksList: React.FC<PendingTasksListProps> = ({ profile }) => {
  const getTasks = (): Task[] => {
    if (!profile) return [];

    const tasks: Task[] = [];

    // Company Information Tasks
    const companyFields = [
      profile.company_name,
      profile.registration_number,
      profile.description
    ];
    const companyComplete = companyFields.every(field => field && field.length > 0);
    
    tasks.push({
      id: 'company-info',
      title: 'Company Information',
      description: 'Fill in basic company details',
      status: companyComplete ? 'completed' : 'pending',
      priority: 'high'
    });

    // Contact Information Tasks
    const contactFields = [
      profile.address,
      profile.city,
      profile.contact_person_name,
      profile.contact_person_phone
    ];
    const contactComplete = contactFields.every(field => field && field.length > 0);
    
    tasks.push({
      id: 'contact-info',
      title: 'Contact Information',
      description: 'Complete address and contact details',
      status: contactComplete ? 'completed' : 'pending',
      priority: 'high'
    });

    // Services & Destinations
    const servicesComplete = (Array.isArray(profile.services_offered) && profile.services_offered.length > 0) && 
                            (Array.isArray(profile.destinations_covered) && profile.destinations_covered.length > 0);
    
    tasks.push({
      id: 'services-destinations',
      title: 'Services & Destinations',
      description: 'Define your services and destinations',
      status: servicesComplete ? 'completed' : 'pending',
      priority: 'medium'
    });

    // Document Upload Tasks
    const documents = [
      { field: profile.certificate_of_incorporation_url, name: 'Certificate of Incorporation' },
      { field: profile.business_permit_url, name: 'Business Permit' },
      { field: profile.kato_membership_url, name: 'KATO Membership' }
    ];

    documents.forEach((doc, index) => {
      tasks.push({
        id: `document-${index}`,
        title: doc.name,
        description: `Upload ${doc.name.toLowerCase()}`,
        status: doc.field && doc.field.length > 0 ? 'completed' : 'pending',
        priority: 'medium'
      });
    });

    return tasks;
  };

  const tasks = getTasks();
  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getPriorityBadge = (priority: Task['priority']) => {
    const variants = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary'
    } as const;

    return (
      <Badge variant={variants[priority]} className="text-xs">
        {priority}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Profile Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{completedTasks.length}/{tasks.length} completed</span>
        </div>
        
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0}%` 
            }}
          />
        </div>

        {pendingTasks.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2 text-destructive">
              Pending Tasks ({pendingTasks.length})
            </h4>
            <div className="space-y-2">
              {pendingTasks.map((task) => (
                <div key={task.id} className="p-3 border rounded-lg bg-muted/50">
                  <div className="flex items-start gap-2">
                    {getStatusIcon(task.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{task.title}</span>
                        {getPriorityBadge(task.priority)}
                      </div>
                      <p className="text-xs text-muted-foreground">{task.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {completedTasks.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2 text-green-600">
              Completed ({completedTasks.length})
            </h4>
            <div className="space-y-1">
              {completedTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-2 p-2 text-sm">
                  {getStatusIcon(task.status)}
                  <span className="text-muted-foreground">{task.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};