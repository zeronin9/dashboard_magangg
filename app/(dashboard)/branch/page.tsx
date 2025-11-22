// app/(dashboard)/dashboard/branch/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';

export default function BranchDashboard() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [menuData, licensesData] = await Promise.all([
        fetchWithAuth('/cashier/menu'),
        fetchWithAuth('/license/my-branch'),
      ]);
      setMenuItems(menuData);
      setLicenses(licensesData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const activeLicenses = licenses.filter((l) => l.license_status === 'Active').length;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin Cabang</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-gray-500 text-sm font-medium">Total Menu</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">{menuItems.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-gray-500 text-sm font-medium">Perangkat Aktif</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{activeLicenses}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-gray-500 text-sm font-medium">Total Lisensi</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{licenses.length}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition">
            <div className="text-3xl mb-2">📋</div>
            <div className="text-sm font-medium">Kelola Menu</div>
          </button>
          <button className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-sm font-medium">Kelola Kasir</div>
          </button>
          <button className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-sm font-medium">Tambah Diskon</div>
          </button>
          <button className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-sm font-medium">Lihat Laporan</div>
          </button>
        </div>
      </div>
    </div>
  );
}
