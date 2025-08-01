import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { ChangeDetail } from '@/modules/changes/components/ChangeDetail/ChangeDetail';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Change #${params.id.substring(0, 8)} | NexIT ITSM`,
  };
}

export default function Page({ params }: { params: { id: string } }) {
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
