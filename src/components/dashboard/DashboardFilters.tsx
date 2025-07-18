
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DashboardFiltersProps {
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
}

export const DashboardFilters = ({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusFilterChange
}: DashboardFiltersProps) => {
  return (
    <div className="flex flex-col gap-4 bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search leads by name, email, or destination..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-full">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="contacted">Contacted</SelectItem>
          <SelectItem value="quoted">Quoted</SelectItem>
          <SelectItem value="booked">Booked</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
