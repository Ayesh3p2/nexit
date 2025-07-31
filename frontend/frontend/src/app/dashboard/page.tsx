'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default function DashboardPage() {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    isAuthenticated().then((auth) => {
      if (!auth) {
        router.replace('/login');
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-lg text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-xl rounded-lg bg-white p-10 shadow-xl dark:bg-gray-900">
        <h1 className="text-3xl font-bold mb-4">Welcome to NexIT Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">You are signed in! This is your main app entry point. (Replace with real dashboard content.)</p>
      </div>
    </div>
  );
}
