'use client';

import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { Partner, License } from '@/types';
import { Smartphone, Search, AlertCircle, Loader2, CheckCircle, Clock, Key } from 'lucide-react';

export default function LicensesPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [licenses, setLicenses] = useState<License[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const data = await fetchWithAuth('/partner');
      setPartners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading partners:', error);
    }
  };

  const loadLicenses = async (partnerId: string) => {
    try {
      setIsLoading(true);
      const data = await fetchWithAuth(`/license/partner/${partnerId}`);
      setLicenses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading licenses:', error);
      setLicenses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePartnerChange = (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    if (partnerId) {
      loadLicenses(partnerId);
    } else {
      setLicenses([]);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      Active: { color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle, label: 'Aktif' },
      Assigned: { color: 'text-blue-600', bg: 'bg-blue-50', icon: Clock, label: 'Dialokasikan' },
      Pending: { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Key, label: 'Menunggu' },
    };
    return configs[status as keyof typeof configs] || configs.Pending;
  };

  const activeCount = licenses.filter(l => l.license_status === 'Active').length;
  const assignedCount = licenses.filter(l => l.license_status === 'Assigned').length;
  const pendingCount = licenses.filter(l => l.license_status === 'Pending').length;

  const filteredLicenses = licenses.filter(license =>
    license.activation_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    license.device_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    license.branch?.branch_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-10">
      
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pemantauan Lisensi</h1>
        <p className="text-gray-600 mt-2 text-base">
          Lacak dan kelola lisensi perangkat di semua mitra
        </p>
      </div>

      {/* PARTNER SELECTOR */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-8">
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Pilih Mitra untuk Melihat Lisensi
        </label>
        <div className="relative">
          <select
            value={selectedPartnerId}
            onChange={(e) => handlePartnerChange(e.target.value)}
            className="w-full md:w-1/2 border border-gray-300 p-4 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none font-medium text-gray-700"
          >
            <option value="">-- Pilih Mitra --</option>
            {partners.map(partner => (
              <option key={partner.partner_id} value={partner.partner_id}>
                {partner.business_name} ({partner.status === 'Active' ? 'Aktif' : 'Ditangguhkan'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedPartnerId && (
        <>
          
          {/* LICENSES TABLE */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Detail Lisensi</h2>
                
                {/* Search Bar */}
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan kode, perangkat, atau cabang..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-500">Memuat lisensi...</p>
                </div>
              </div>
            ) : filteredLicenses.length === 0 ? (
              <div className="text-center py-20">
                <Smartphone size={60} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">
                  {searchTerm ? 'Tidak ada lisensi yang cocok dengan pencarian' : 'Tidak ada lisensi tersedia untuk mitra ini'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Kode Aktivasi
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Informasi Perangkat
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Cabang
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLicenses.map((license) => {
                      const statusConfig = getStatusConfig(license.license_status);
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <tr key={license.license_id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className="font-mono text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                              {license.activation_code}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm">
                              <div className="font-semibold text-gray-900">
                                {license.device_name || '-'}
                              </div>
                              <div className="text-gray-500 text-xs mt-1">
                                {license.device_id || 'Tidak ada ID perangkat'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {license.branch?.branch_name || '-'}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${statusConfig.bg} ${statusConfig.color}`}>
                              <StatusIcon size={16} />
                              {statusConfig.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* LEGEND */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-2xl">
            <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
              <AlertCircle size={20} />
              Informasi Status Lisensi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Aktif</p>
                  <p className="text-gray-600">Lisensi sedang digunakan oleh perangkat</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Dialokasikan</p>
                  <p className="text-gray-600">Sudah ditugaskan ke cabang tapi belum diaktifkan</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Key size={18} className="text-yellow-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Menunggu</p>
                  <p className="text-gray-600">Tersedia dan siap untuk dialokasikan</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
