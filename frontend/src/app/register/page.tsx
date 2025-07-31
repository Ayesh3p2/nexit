import { AuthForm } from '@/modules/auth/components/AuthForm';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl dark:bg-gray-900">
        <h2 className="mb-6 text-2xl font-bold text-center">Create your NexIT account</h2>
        <AuthForm mode="register" />
      </div>
    </div>
  );
}
