import { Suspense } from 'react';
import { Metadata } from 'next';
import { ProblemList } from '../../modules/problems/components/ProblemList/ProblemList';

export const metadata: Metadata = {
  title: 'Problems | NexIT ITSM',
  description: 'View and manage all problems in the system',
};

export default function ProblemsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }>
        <ProblemList />
      </Suspense>
    </div>
  );
}
