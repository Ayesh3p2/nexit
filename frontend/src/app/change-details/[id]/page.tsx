'use client';

import { notFound } from 'next/navigation';

export default function ChangeDetailsPage({ params }: { params: { id: string } }) {
  if (!params?.id) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1>Change Details - ID: {params.id}</h1>
      <p>This is a new implementation of the change details page.</p>
    </div>
  );
}
