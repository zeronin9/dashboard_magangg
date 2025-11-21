'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Partner, PartnerSubscription, License, SubscriptionPlan } from '@/types';
import Modal from '@/components/ui/Modal';

export default function PartnerDetailPage() {
  const params = useParams();
  const partnerId = params.id as string;

  // State Data
  const [partner, setPartner] = useState<Partner | null>(null);
  const [subscriptions, setSubscriptions] = useState<PartnerSubscription[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  
  // State Modal
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [subForm, setSubForm] = useState({
    plan_id: '',
    start_date: new Date().toISOString().split('T')[0], // Default hari ini
    payment_status: 'Paid'
  });

  // Fetch Data Awal
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get Partner Data (Kita filter dari list all partner karena endpoint specific by ID tidak dirinci di docs utama, 
        //    tapi biasanya ada GET /partner/:id. Jika tidak, kita pakai GET /partner lalu find).
        //    Untuk efisiensi, asumsi GET /partner me-return array, kita cari manual:
        const resPartner = await api.get('/partner');
        const found = resPartner.data.find((p: Partner) => p.partner_id === partnerId);
        setPartner(found || null);

        // 2. Get Subscriptions History
        const resSubs = await api.get(`/partner-subscription/partner/${partnerId}`);
        setSubscriptions(resSubs.data);

        // 3. Get Licenses
        const resLicenses = await api.get(`/license/partner/${partnerId}`);
        setLicenses(resLicenses.data);

        // 4. Get Available Plans (untuk dropdown form)
        const resPlans = await api.get('/subscription-plan');
        setAvailablePlans(resPlans.data);

      } catch (error) {
        console.error("Error fetching partner details", error);
      }
    };

    if (partnerId) fetchData();
  }, [partnerId]);

  // Handle Submit Subscription Baru
  const handleAddSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        partner_id: partnerId,
        plan_id: subForm.plan_id,
        start_date: new Date(subForm.start_date).toISOString(),
        payment_status: subForm.payment_status
      };

      await api.post('/partner-subscription', payload);
      alert('Paket langganan berhasil ditambahkan!');
      setIsSubModalOpen(false);
      
      // Refresh list
      const resSubs = await api.get(`/partner-subscription/partner/${partnerId}`);
      setSubscriptions(resSubs.data);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menambahkan langganan');
    }
  };

  if (!partner) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header Detail */}
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-2">{partner.business_name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
           <p>📧 {partner.business_email}</p>
           <p>📞 {partner.business_phone}</p>
           <p>Status: <span className="font-bold">{partner.status}</span></p>
        </div>
      </div>

      {/* Section Langganan */}
      <div className="bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Riwayat Langganan</h2>
          <button 
            onClick={() => setIsSubModalOpen(true)}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            + Tetapkan Paket Baru
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-2">Nama Paket</th>
                <th className="px-4 py-2">Mulai</th>
                <th className="px-4 py-2">Selesai</th>
                <th className="px-4 py-2">Pembayaran</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {subscriptions.map((sub, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 font-medium">
                    {sub.plan_snapshot?.plan_name || sub.plan_id}
                  </td>
                  <td className="px-4 py-2">{new Date(sub.start_date).toLocaleDateString('id-ID')}</td>
                  <td className="px-4 py-2">{new Date(sub.end_date).toLocaleDateString('id-ID')}</td>
                  <td className="px-4 py-2">{sub.payment_status}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${sub.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {sub.status}
                    </span>
                  </td>
                </tr>
              ))}
              {subscriptions.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-500">Belum ada data langganan</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section Lisensi */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Pemantauan Lisensi Perangkat</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-2">Kode Aktivasi</th>
                <th className="px-4 py-2">Device Name</th>
                <th className="px-4 py-2">Cabang</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {licenses.map((lic) => (
                <tr key={lic.license_id}>
                  <td className="px-4 py-2 font-mono">{lic.activation_code}</td>
                  <td className="px-4 py-2">{lic.device_name || '-'}</td>
                  <td className="px-4 py-2">{lic.branch?.branch_name || '-'}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      lic.license_status === 'Active' ? 'bg-green-100 text-green-800' : 
                      lic.license_status === 'Assigned' ? 'bg-blue-100 text-blue-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {lic.license_status}
                    </span>
                  </td>
                </tr>
              ))}
              {licenses.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">Belum ada lisensi</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Subscription */}
      <Modal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} title="Tetapkan Paket Langganan">
        <form onSubmit={handleAddSubscription} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Pilih Paket</label>
            <select 
              required 
              className="w-full border p-2 rounded bg-white"
              value={subForm.plan_id}
              onChange={(e) => setSubForm({...subForm, plan_id: e.target.value})}
            >
              <option value="">-- Pilih Paket --</option>
              {availablePlans.map(plan => (
                <option key={plan.id || plan.plan_id} value={plan.id || plan.plan_id}>
                  {plan.plan_name} - Rp {plan.price.toLocaleString()} ({plan.duration_months} bln)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Tanggal Mulai</label>
            <input 
              type="date" 
              required 
              value={subForm.start_date}
              onChange={(e) => setSubForm({...subForm, start_date: e.target.value})}
              className="w-full border p-2 rounded" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Status Pembayaran</label>
            <select 
              value={subForm.payment_status}
              onChange={(e) => setSubForm({...subForm, payment_status: e.target.value})}
              className="w-full border p-2 rounded bg-white"
            >
              <option value="Paid">Paid (Lunas)</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Simpan Transaksi
          </button>
        </form>
      </Modal>
    </div>
  );
}