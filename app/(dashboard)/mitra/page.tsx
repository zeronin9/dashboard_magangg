// app/(dashboard)/dashboard/partner/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { Branch, Product, License } from '@/types';

export default function PartnerDashboard() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [branchesData, productsData, licensesData] = await Promise.all([
        fetchWithAuth('/branch'),
        fetchWithAuth('/product'),
        fetchWithAuth('/license'),
      ]);
      setBranches(branchesData);
      setProducts(productsData);
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
  const pendingLicenses = licenses.filter((l) => l.license_status === 'Pending').length;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin Mitra</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-gray-500 text-sm font-medium">Total Cabang</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{branches.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-gray-500 text-sm font-medium">Total Produk</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{products.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-gray-500 text-sm font-medium">Lisensi Aktif</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{activeLicenses}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-gray-500 text-sm font-medium">Lisensi Tersedia</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingLicenses}</p>
        </div>
      </div>

      {/* Branches List */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Daftar Cabang</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Nama Cabang</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Alamat</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Telepon</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => (
                <tr key={branch.branch_id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{branch.branch_name}</td>
                  <td className="py-3 px-4">{branch.address}</td>
                  <td className="py-3 px-4">{branch.phone_number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
