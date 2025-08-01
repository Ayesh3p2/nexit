'use client';

import { useParams } from 'next/navigation';

export default function TestPage() {
  const params = useParams();
  
  if (!params?.id) {
    return <div>No ID provided</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1>Test Page - ID: {params.id}</h1>
    </div>
  );
}
