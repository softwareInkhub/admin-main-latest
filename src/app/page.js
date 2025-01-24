'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      router.push(user ? '/dashboard' : '/login');
    }
  }, [loading, user, router]);

  return <LoadingScreen />;
}
