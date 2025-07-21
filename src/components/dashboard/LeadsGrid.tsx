
import { Lead } from '@/types/api';
import { LeadCard } from '@/components/leads/LeadCard';

interface LeadsGridProps {
  leads: Lead[];
  onViewDetails: (lead: Lead) => void;
  onUpdateStatus: (leadId: string, newStatus: Lead['status']) => void;
}

export const LeadsGrid = ({ leads, onViewDetails, onUpdateStatus }: LeadsGridProps) => {
  if (leads.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <p className="text-gray-500 text-sm sm:text-base">No leads found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 w-full">
      {leads.map((lead) => (
        <LeadCard
          key={lead.id}
          lead={lead}
          onViewDetails={onViewDetails}
          onUpdateStatus={onUpdateStatus}
        />
      ))}
    </div>
  );
};
