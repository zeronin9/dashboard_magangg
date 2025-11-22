'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/api';
import { Partner } from '@/types';

export default function PartnerListPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form Data untuk Registrasi Partner Baru
  const [formData, setFormData] = useState({
    business_name: '',
    business_email: '',
    business_phone: '',
    username: '',
    password: ''
  });

  const fetchPartners = async () => {
    try {
      setIsLoading(true);
      const data = await fetchWithAuth('/partner');
      setPartners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching partners:', error);
      alert('Gagal mengambil data mitra');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth('/partner', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      alert('Mitra dan Akun Super Admin berhasil dibuat!');
      setIsModalOpen(false);
      fetchPartners();
      setFormData({ 
        business_name: '', 
        business_email: '', 
        business_phone: '', 
        username: '', 
        password: '' 
      });
    } catch (error: any) {
      alert(error.message || 'Gagal mendaftarkan mitra');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menonaktifkan mitra ini?')) return;
    try {
      await fetchWithAuth(`/partner/${id}`, {
        method: 'DELETE',
      });
      alert('Mitra berhasil dinonaktifkan');
      fetchPartners();
    } catch (error: any) {
      alert('Gagal menonaktifkan mitra');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Daftar Mitra</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold shadow-md"
        >
          + Daftarkan Mitra Baru
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Nama Bisnis
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Email / Kontak
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Tanggal Bergabung
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {partners.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Belum ada data mitra
                </td>
              </tr>
            ) : (
              partners.map((partner) => (
                <tr key={partner.partner_id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-900">{partner.business_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{partner.business_email}</div>
                    <div className="text-sm text-gray-500">{partner.business_phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(partner.joined_date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      partner.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {partner.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <Link 
                      href={`/dashboard/platform/partners/${partner.partner_id}`} 
                      className="text-blue-600 hover:text-blue-900 transition"
                    >
                      Detail
                    </Link>
                    {partner.status === 'Active' && (
                      <button 
                        onClick={() => handleDelete(partner.partner_id)} 
                        className="text-red-600 hover:text-red-900 transition"
                      >
                        Nonaktifkan
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Register Partner */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Registrasi Mitra Baru</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Bisnis <span className="text-red-500">*</span>
                </label>
                <input 
                  required 
                  type="text" 
                  value={formData.business_name} 
                  onChange={(e) => setFormData({...formData, business_name: e.target.value})} 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Contoh: Kopi Kenangan"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Bisnis <span className="text-red-500">*</span>
                </label>
                <input 
                  required 
                  type="email" 
                  value={formData.business_email} 
                  onChange={(e) => setFormData({...formData, business_email: e.target.value})} 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="email@bisnis.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  No. Telepon <span className="text-red-500">*</span>
                </label>
                <input 
                  required 
                  type="text" 
                  value={formData.business_phone} 
                  onChange={(e) => setFormData({...formData, business_phone: e.target.value})} 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="08123456789"
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <p className="text-sm font-bold text-gray-700 mb-3">
                  AKUN SUPER ADMIN PERTAMA
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input 
                      required 
                      type="text" 
                      value={formData.username} 
                      onChange={(e) => setFormData({...formData, username: e.target.value})} 
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      placeholder="username_admin"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input 
                      required 
                      type="password" 
                      value={formData.password} 
                      onChange={(e) => setFormData({...formData, password: e.target.value})} 
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      placeholder="Minimal 6 karakter"
                      minLength={6}
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold shadow-md"
                >
                  Daftarkan Mitra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}