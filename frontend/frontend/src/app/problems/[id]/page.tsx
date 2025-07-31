import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { ProblemDetail } from '@/modules/problems/components/ProblemDetail';

interface ProblemPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ProblemPageProps): Promise<Metadata> {
  // In a real app, you would fetch the problem here to get the title
  return {
    title: `Problem #${params.id.substring(0, 8)} | NexIT ITSM`,
  };
}

export default function ProblemPage({ params }: ProblemPageProps) {
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
        <ProblemDetail problemId={params.id} />
      </Suspense>
    </div>
  );
}
