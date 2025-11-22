// app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.replace('/login');
    } else {
      // If logged in, redirect based on role
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        switch (user.role) {
          case 'admin_platform':
            router.replace('/dashboard/platform');
            break;
          case 'super_admin':
            router.replace('/dashboard/partner');
            break;
          case 'branch_admin':
            router.replace('/dashboard/branch');
            break;
          default:
            router.replace('/login');
        }
      } catch (error) {
        router.replace('/login');
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Mengarahkan...</p>
      </div>
    </div>
  );
}
