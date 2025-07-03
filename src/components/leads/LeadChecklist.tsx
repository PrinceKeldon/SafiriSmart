
import React, { useState, useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LeadTodoItem } from '@/types/lead';
import { useUpdateLeadTodoList } from '@/hooks/useUpdateLeadTodoList';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LeadChecklistProps {
  leadId: string;
  todoChecklist: LeadTodoItem[];
}

export const LeadChecklist: React.FC<LeadChecklistProps> = ({ leadId, todoChecklist }) => {
  const [localChecklist, setLocalChecklist] = useState<LeadTodoItem[]>(todoChecklist);
  const updateTodoList = useUpdateLeadTodoList();

  // Debounced update function
  const debouncedUpdate = useCallback(
    debounce((updatedChecklist: LeadTodoItem[]) => {
      updateTodoList.mutate({ leadId, todoChecklist: updatedChecklist });
    }, 1000),
    [leadId, updateTodoList]
  );

  const handleToggleTask = (taskId: string) => {
    const updatedChecklist = localChecklist.map(item =>
      item.id === taskId
        ? { ...item, completed: !item.completed }
        : item
    );
    
    setLocalChecklist(updatedChecklist);
    debouncedUpdate(updatedChecklist);
  };

  const completedCount = localChecklist.filter(item => item.completed).length;
  const totalCount = localChecklist.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Lead Management Checklist
            </CardTitle>
            <CardDescription>
              Track your progress with this lead
            </CardDescription>
          </div>
          <Badge variant={progressPercentage === 100 ? "default" : "secondary"}>
            {completedCount}/{totalCount} Complete
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {localChecklist.map((item) => (
            <div 
              key={item.id} 
              className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                item.completed 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <Checkbox
                id={item.id}
                checked={item.completed}
                onCheckedChange={() => handleToggleTask(item.id)}
                className="flex-shrink-0"
              />
              
              <div className="flex items-center gap-2 flex-1">
                {item.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-400" />
                )}
                
                <label 
                  htmlFor={item.id}
                  className={`text-sm font-medium cursor-pointer flex-1 ${
                    item.completed 
                      ? 'text-green-700 line-through' 
                      : 'text-gray-900'
                  }`}
                >
                  {item.task}
                </label>
              </div>
              
              {!item.completed && (
                <Clock className="w-4 h-4 text-orange-500" />
              )}
            </div>
          ))}
        </div>
        
        {progressPercentage === 100 && (
          <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm font-medium">
              🎉 Congratulations! You've completed all tasks for this lead.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Simple debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
