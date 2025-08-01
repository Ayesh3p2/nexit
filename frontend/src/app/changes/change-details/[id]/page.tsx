import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ChangeDetail } from '@/modules/changes/components/ChangeDetail/ChangeDetail';

export default function ChangeDetailsPage({ params }: { params: { id: string } }) {
  if (!params?.id) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }>
        <ChangeDetail changeId={params.id} />
      </Suspense>
    </div>
  );
}
