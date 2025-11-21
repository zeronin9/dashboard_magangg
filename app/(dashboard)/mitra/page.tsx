'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Branch } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function MitraDashboard() {
  const { user, logout } = useAuth();
  // Inisialisasi state sebagai array kosong
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        // PERBAIKAN: Tambahkan <Branch[]> di sini agar TypeScript tahu
        // bahwa respon API adalah array dari object Branch.
        const res = await api.get<Branch[]>('/branch');
        
        // Sekarang res.data sudah dikenali sebagai Branch[], jadi error hilang
        setBranches(res.data);
      } catch (error) {
        console.error("Gagal mengambil data cabang:", error);
      }
    };
    fetchBranches();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard Mitra (Pemilik)</h1>
        <button onClick={logout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">
          Logout
        </button>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Cabang</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alamat</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telepon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {branches.length > 0 ? (
              branches.map((branch) => (
                <tr key={branch.branch_id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{branch.branch_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{branch.address}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{branch.phone_number}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                  Belum ada data cabang.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}