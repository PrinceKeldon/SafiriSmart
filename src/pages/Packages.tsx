
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PackageManagement } from '@/components/packages/PackageManagement';
import { PageSEO } from '@/components/seo/PageSEO';
import { createBreadcrumbSchema } from '@/utils/structuredData';
import { trackPageView } from '@/utils/analytics';
import { useEffect } from 'react';

export default function Packages() {
  useEffect(() => {
    trackPageView('Packages');
  }, []);

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Dashboard', url: '/dashboard' },
    { name: 'Packages', url: '/packages' }
  ]);

  return (
    <>
      <PageSEO
        title="Kenya Safari Package Management - SafiriSmart Operator Dashboard"
        description="Manage your Kenya safari tour packages with SafiriSmart. Create, edit, and organize your Kenya safari tour offerings for better customer matching and booking conversions."
        keywords="Kenya safari package management, safari packages Kenya, tour operator dashboard, Kenya wildlife tour creation, safari booking system"
        canonicalUrl="/packages"
        structuredData={breadcrumbSchema}
        noIndex={true}
      />
      
      <DashboardLayout>
        <PackageManagement />
      </DashboardLayout>
    </>
  );
}
