'use client';

import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { Partner, License } from '@/types';

export default function LicensesPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [licenses, setLicenses] = useState<License[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      alert('Gagal mengambil data lisensi');
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

  const getStatusBadge = (status: string) => {
    const styles = {
      Active: 'bg-green-100 text-green-800',
      Assigned: 'bg-blue-100 text-blue-800',
      Pending: 'bg-yellow-100 text-yellow-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-600';
  };

  const activeCount = licenses.filter(l => l.license_status === 'Active').length;
  const assignedCount = licenses.filter(l => l.license_status === 'Assigned').length;
  const pendingCount = licenses.filter(l => l.license_status === 'Pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Monitoring Lisensi Perangkat</h1>
        <p className="text-gray-500 mt-1">Pantau penggunaan lisensi per mitra</p>
      </div>

      {/* Partner Selector */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Pilih Mitra untuk Melihat Lisensi
        </label>
        <select
          value={selectedPartnerId}
          onChange={(e) => handlePartnerChange(e.target.value)}
          className="w-full md:w-1/2 border border-gray-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        >
          <option value="">-- Pilih Mitra --</option>
          {partners.map(partner => (
            <option key={partner.partner_id} value={partner.partner_id}>
              {partner.business_name} ({partner.status})
            </option>
          ))}
        </select>
      </div>

      {selectedPartnerId && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
              <p className="text-green-100 text-sm">Lisensi Aktif (Terpakai)</p>
              <h3 className="text-4xl font-bold mt-2">{activeCount}</h3>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
              <p className="text-blue-100 text-sm">Lisensi Assigned (Dialokasi)</p>
              <h3 className="text-4xl font-bold mt-2">{assignedCount}</h3>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl shadow-lg text-white">
              <p className="text-yellow-100 text-sm">Lisensi Pending (Tersedia)</p>
              <h3 className="text-4xl font-bold mt-2">{pendingCount}</h3>
            </div>
          </div>

          {/* Licenses Table */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Detail Lisensi</h2>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-600">Memuat lisensi...</p>
                </div>
              </div>
            ) : licenses.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔑</div>
                <p className="text-gray-500">Mitra ini belum memiliki lisensi perangkat</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                        Kode Aktivasi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                        Device ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                        Device Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                        Cabang
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {licenses.map((license) => (
                      <tr key={license.license_id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm font-semibold text-indigo-600">
                            {license.activation_code}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {license.device_id || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {license.device_name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {license.branch?.branch_name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(license.license_status)}`}>
                            {license.license_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Status Lisensi:</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li><strong>Active:</strong> Lisensi sedang digunakan oleh perangkat</li>
              <li><strong>Assigned:</strong> Lisensi sudah dialokasikan ke cabang tapi belum diaktifkan</li>
              <li><strong>Pending:</strong> Lisensi tersedia, belum dialokasikan ke cabang manapun</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
