import { Metadata } from 'next';
import { Suspense } from 'react';
import { IncidentForm } from '../../../modules/incidents/components/IncidentForm/IncidentForm';

export const metadata: Metadata = {
  title: 'New Incident | NexIT ITSM',
  description: 'Create a new incident',
};

export default function NewIncidentPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }>
        <IncidentForm />
      </Suspense>
    </div>
  );
}
