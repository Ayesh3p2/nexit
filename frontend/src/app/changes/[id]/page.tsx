'use client';

import { notFound } from 'next/navigation';

export default function Page({ params }: { params: { id: string } }) {
  if (!params?.id) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1>Change Details - ID: {params.id}</h1>
      <p>This is a simplified version of the changes page.</p>
    </div>
  );
}
