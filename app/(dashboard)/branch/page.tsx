'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

// 1. Definisikan Interface untuk data yang diharapkan dari API
interface SalesSummary {
  total_sales: string;
  transaction_count: number;
  total_tax: string;
  total_subtotal?: string;
  total_discount?: string;
}

interface SalesReportResponse {
  summary: SalesSummary;
  data: any[]; // Bisa diganti dengan tipe Transaction[] jika detailnya dibutuhkan
}

export default function BranchDashboard() {
  const { user, logout } = useAuth();
  
  // 2. Ubah state dari <any> menjadi tipe yang spesifik agar lebih aman
  const [summary, setSummary] = useState<SalesSummary | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        // 3. Tambahkan Generics <SalesReportResponse> di sini agar res.data dikenali strukturnya
        const res = await api.get<SalesReportResponse>('/report/sales');
        
        // Sekarang TypeScript tahu bahwa res.data memiliki properti .summary
        setSummary(res.data.summary);
      } catch (error) {
        console.error("Gagal mengambil laporan:", error);
      }
    };
    fetchReport();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard Cabang: {user?.name}</h1>
        <button onClick={logout} className="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200 transition">
          Keluar
        </button>
      </div>

      {summary ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded border border-blue-100 shadow-sm">
            <p className="text-sm text-gray-500">Total Penjualan</p>
            {/* Gunakan optional chaining (?.) atau fallback '0' untuk keamanan */}
            <p className="text-2xl font-bold text-blue-700">
              Rp {Number(summary.total_sales || 0).toLocaleString('id-ID')}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded border border-green-100 shadow-sm">
            <p className="text-sm text-gray-500">Jumlah Transaksi</p>
            <p className="text-2xl font-bold text-green-700">
              {summary.transaction_count || 0}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded border border-yellow-100 shadow-sm">
             <p className="text-sm text-gray-500">Pajak Terkumpul</p>
             <p className="text-2xl font-bold text-yellow-700">
               Rp {Number(summary.total_tax || 0).toLocaleString('id-ID')}
             </p>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500 bg-gray-50 rounded animate-pulse">
          Memuat data laporan...
        </div>
      )}

      {/* Area untuk fitur tambahan Branch Admin (L1) */}
    </div>
  );
}