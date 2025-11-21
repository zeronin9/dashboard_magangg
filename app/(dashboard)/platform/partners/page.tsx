'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Partner } from '@/types';
import Modal from '@/components/ui/Modal';

export default function PartnerListPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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
      const res = await api.get('/partner');
      setPartners(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/partner', formData);
      alert('Mitra dan Akun Super Admin berhasil dibuat!');
      setIsModalOpen(false);
      fetchPartners();
      setFormData({ business_name: '', business_email: '', business_phone: '', username: '', password: '' });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal mendaftarkan mitra');
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm('Apakah Anda yakin ingin menonaktifkan mitra ini?')) return;
    try {
      await api.delete(`/partner/${id}`);
      fetchPartners();
    } catch (error: any) {
      alert('Gagal menonaktifkan mitra');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Daftar Mitra</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Daftarkan Mitra Baru
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Bisnis</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email / Kontak</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {partners.map((partner) => (
              <tr key={partner.partner_id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{partner.business_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{partner.business_email}</div>
                  <div className="text-sm text-gray-500">{partner.business_phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    partner.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {partner.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Link href={`/platform/partners/${partner.partner_id}`} className="text-blue-600 hover:text-blue-900">
                    Detail & Lisensi
                  </Link>
                  {partner.status === 'Active' && (
                    <button onClick={() => handleDelete(partner.partner_id)} className="text-red-600 hover:text-red-900">
                      Nonaktifkan
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Register Partner */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrasi Mitra Baru">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Nama Bisnis</label>
            <input required type="text" value={formData.business_name} onChange={(e) => setFormData({...formData, business_name: e.target.value})} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Email Bisnis</label>
            <input required type="email" value={formData.business_email} onChange={(e) => setFormData({...formData, business_email: e.target.value})} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">No. Telepon</label>
            <input required type="text" value={formData.business_phone} onChange={(e) => setFormData({...formData, business_phone: e.target.value})} className="w-full border p-2 rounded" />
          </div>
          <hr className="my-2"/>
          <p className="text-xs text-gray-500 font-bold">AKUN SUPER ADMIN PERTAMA</p>
          <div>
            <label className="block text-sm font-medium">Username</label>
            <input required type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input required type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full border p-2 rounded" />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Daftarkan Mitra
          </button>
        </form>
      </Modal>
    </div>
  );
}