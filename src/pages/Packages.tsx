
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PackageManagement } from '@/components/packages/PackageManagement';

export default function Packages() {
  return (
    <DashboardLayout>
      <PackageManagement />
    </DashboardLayout>
  );
}
