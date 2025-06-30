
import { useMemo } from 'react';
import { Lead } from '@/types/api';

interface DashboardStatsProps {
  leads: Lead[];
}

export const DashboardStats = ({ leads }: DashboardStatsProps) => {
  const stats = useMemo(() => {
    const total = leads.length;
    const newLeads = leads.filter(l => l.status === 'new').length;
    const quoted = leads.filter(l => l.status === 'quoted').length;
    const booked = leads.filter(l => l.status === 'booked').length;
    
    return { total, newLeads, quoted, booked };
  }, [leads]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-sm font-medium text-gray-500">Total Leads</h3>
        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-sm font-medium text-gray-500">New Leads</h3>
        <p className="text-2xl font-bold text-blue-600">{stats.newLeads}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-sm font-medium text-gray-500">Quotes Sent</h3>
        <p className="text-2xl font-bold text-purple-600">{stats.quoted}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-sm font-medium text-gray-500">Bookings</h3>
        <p className="text-2xl font-bold text-green-600">{stats.booked}</p>
      </div>
    </div>
  );
};
