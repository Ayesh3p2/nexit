import { AuthForm } from '@/modules/auth/components/AuthForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl dark:bg-gray-900">
        <h2 className="mb-6 text-2xl font-bold text-center">Sign in to NexIT</h2>
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
