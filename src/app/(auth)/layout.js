'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function AuthLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [loading, user, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    return null;
  }

  return children;
} 