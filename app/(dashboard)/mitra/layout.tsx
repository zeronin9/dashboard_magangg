// app/(dashboard)/dashboard/partner/layout.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'super_admin')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">H</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Horeka Pos+</h1>
                <p className="text-xs text-gray-500">Admin Mitra</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.name}</span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            <Link
              href="/dashboard/partner"
              className="block px-4 py-2 rounded-lg hover:bg-green-50 text-gray-700 hover:text-green-600 transition"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/partner/branches"
              className="block px-4 py-2 rounded-lg hover:bg-green-50 text-gray-700 hover:text-green-600 transition"
            >
              Cabang
            </Link>
            <Link
              href="/dashboard/partner/branch-admins"
              className="block px-4 py-2 rounded-lg hover:bg-green-50 text-gray-700 hover:text-green-600 transition"
            >
              Admin Cabang
            </Link>
            <Link
              href="/dashboard/partner/categories"
              className="block px-4 py-2 rounded-lg hover:bg-green-50 text-gray-700 hover:text-green-600 transition"
            >
              Kategori
            </Link>
            <Link
              href="/dashboard/partner/products"
              className="block px-4 py-2 rounded-lg hover:bg-green-50 text-gray-700 hover:text-green-600 transition"
            >
              Produk
            </Link>
            <Link
              href="/dashboard/partner/discounts"
              className="block px-4 py-2 rounded-lg hover:bg-green-50 text-gray-700 hover:text-green-600 transition"
            >
              Diskon
            </Link>
            <Link
              href="/dashboard/partner/licenses"
              className="block px-4 py-2 rounded-lg hover:bg-green-50 text-gray-700 hover:text-green-600 transition"
            >
              Lisensi
            </Link>
            <Link
              href="/dashboard/partner/reports"
              className="block px-4 py-2 rounded-lg hover:bg-green-50 text-gray-700 hover:text-green-600 transition"
            >
              Laporan
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
