import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { IncidentDetail } from '@/modules/incidents/components/IncidentDetail';

interface IncidentPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: IncidentPageProps): Promise<Metadata> {
  // In a real app, you would fetch the incident here to get the title
  return {
    title: `Incident #${params.id.substring(0, 8)} | NexIT ITSM`,
  };
}

export default function IncidentPage({ params }: IncidentPageProps) {
  if (!params.id) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }>
        <IncidentDetail incidentId={params.id} />
      </Suspense>
    </div>
  );
}
