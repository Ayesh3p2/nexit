import { Suspense } from 'react';
import { Metadata } from 'next';
import { ChangeList } from '@/modules/changes/components/ChangeList/ChangeList';

export const metadata: Metadata = {
  title: 'Changes | NexIT ITSM',
  description: 'View and manage all change requests in the system',
};

export default function ChangesPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }>
        <ChangeList />
      </Suspense>
    </div>
  );
}
