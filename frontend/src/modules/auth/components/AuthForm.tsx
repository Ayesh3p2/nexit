'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { loginApi, registerApi } from '../api';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        await loginApi(email, password);
      } else {
        await registerApi(email, password);
      }
      setLoading(false);
      router.push('/dashboard');
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="block mb-1 text-sm font-medium">Email</label>
        <input
          type="email"
          className="w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:border-primary"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block mb-1 text-sm font-medium">Password</label>
        <input
          type="password"
          className="w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:border-primary"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>
      {mode === 'register' && (
        <div>
          <label className="block mb-1 text-sm font-medium">Confirm Password</label>
          <input
            type="password"
            className="w-full rounded border px-3 py-2 focus:outline-none focus:ring focus:border-primary"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
        </div>
      )}
      {error && <div className="text-red-600 text-sm text-center">{error}</div>}
      <Button className="w-full" type="submit" size="lg" disabled={loading}>
        {loading ? (mode === 'login' ? 'Signing in...' : 'Registering...') : mode === 'login' ? 'Sign In' : 'Register'}
      </Button>
    </form>
  );
};

