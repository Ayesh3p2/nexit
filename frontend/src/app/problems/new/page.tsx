import { Metadata } from 'next';
import { Suspense } from 'react';
import { ProblemForm } from '@/modules/problems/components/ProblemForm';

export const metadata: Metadata = {
  title: 'New Problem | NexIT ITSM',
  description: 'Create a new problem record',
};

export default function NewProblemPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }>
        <ProblemForm />
      </Suspense>
    </div>
  );
}
