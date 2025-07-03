
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Eye, CheckCircle, Clock } from 'lucide-react';
import { Lead } from '@/types/lead';

interface DashboardStatsProps {
  leads: Lead[];
}

export const DashboardStats = ({ leads }: DashboardStatsProps) => {
  const stats = {
    total: leads.length,
    unclaimed: leads.filter(lead => lead.status === 'unclaimed').length,
    claimed: leads.filter(lead => lead.status === 'claimed').length,
    contacted: leads.filter(lead => lead.status === 'contacted').length,
    quoted: leads.filter(lead => lead.status === 'quoted').length,
    confirmed: leads.filter(lead => lead.status === 'confirmed').length,
  };

  const conversionRate = stats.total > 0 ? ((stats.confirmed / stats.total) * 100).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            All time leads received
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Claimed Leads</CardTitle>
          <Eye className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.claimed}</div>
          <p className="text-xs text-muted-foreground">
            Currently working on
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.contacted + stats.quoted}</div>
          <p className="text-xs text-muted-foreground">
            In progress
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{conversionRate}%</div>
          <p className="text-xs text-muted-foreground">
            Leads to confirmations
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
