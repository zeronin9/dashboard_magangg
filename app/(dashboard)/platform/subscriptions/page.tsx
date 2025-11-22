'use client';

import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { Partner, SubscriptionPlan } from '@/types';

interface SubscriptionData {
  subscription_id: string;
  partner_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  payment_status: string;
  status: string;
  partner?: {
    business_name: string;
  };
  plan_snapshot?: {
    plan_name: string;
    price: number;
    duration_months: number;
  };
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [summary, setSummary] = useState({
    total_subscriptions_record: 0,
    currently_active_partners: 0,
    total_revenue: '0'
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    partner_id: '',
    plan_id: '',
    start_date: new Date().toISOString().split('T')[0],
    payment_status: 'Paid'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [subsData, partnersData, plansData] = await Promise.all([
        fetchWithAuth('/partner-subscription'),
        fetchWithAuth('/partner'),
        fetchWithAuth('/subscription-plan'),
      ]);

      setSubscriptions(Array.isArray(subsData.data) ? subsData.data : []);
      setSummary(subsData.summary || { total_subscriptions_record: 0, currently_active_partners: 0, total_revenue: '0' });
      setPartners(Array.isArray(partnersData) ? partnersData : []);
      setPlans(Array.isArray(plansData) ? plansData : []);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        partner_id: formData.partner_id,
        plan_id: formData.plan_id,
        start_date: new Date(formData.start_date).toISOString(),
        payment_status: formData.payment_status
      };

      await fetchWithAuth('/partner-subscription', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      alert('Langganan berhasil ditambahkan!');
      setIsModalOpen(false);
      loadData();
      resetForm();
    } catch (error: any) {
      alert(error.message || 'Gagal menambahkan langganan');
    }
  };

  const resetForm = () => {
    setFormData({
      partner_id: '',
      plan_id: '',
      start_date: new Date().toISOString().split('T')[0],
      payment_status: 'Paid'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data langganan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Langganan Mitra</h1>
          <p className="text-gray-500 mt-1">Kelola langganan paket untuk mitra</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold shadow-md flex items-center space-x-2"
        >
          <span>+</span>
          <span>Tetapkan Langganan Baru</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <p className="text-blue-100 text-sm">Total Transaksi Langganan</p>
          <h3 className="text-4xl font-bold mt-2">{summary.total_subscriptions_record}</h3>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <p className="text-green-100 text-sm">Mitra dengan Langganan Aktif</p>
          <h3 className="text-4xl font-bold mt-2">{summary.currently_active_partners}</h3>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
          <p className="text-purple-100 text-sm">Total Revenue</p>
          <h3 className="text-2xl font-bold mt-2">
            Rp {parseInt(summary.total_revenue).toLocaleString('id-ID')}
          </h3>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Riwayat Langganan</h2>
        
        {subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-500 mb-4">Belum ada transaksi langganan</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Tetapkan Langganan Pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Mitra</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Paket</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Harga</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Periode</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Pembayaran</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions.map((sub) => (
                  <tr key={sub.subscription_id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {sub.partner?.business_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {sub.plan_snapshot?.plan_name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {sub.plan_snapshot?.duration_months} bulan
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Rp {(sub.plan_snapshot?.price || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div>{new Date(sub.start_date).toLocaleDateString('id-ID')}</div>
                      <div className="text-xs text-gray-500">
                        s/d {new Date(sub.end_date).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        sub.payment_status === 'Paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {sub.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        sub.status === 'Active' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-800">Tetapkan Langganan Baru</h2>
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
                  Pilih Mitra <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.partner_id}
                  onChange={(e) => setFormData({...formData, partner_id: e.target.value})}
                  className="w-full border border-gray-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                >
                  <option value="">-- Pilih Mitra --</option>
                  {partners.filter(p => p.status === 'Active').map(partner => (
                    <option key={partner.partner_id} value={partner.partner_id}>
                      {partner.business_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pilih Paket <span className="text-red-500">*</span>
                </label>
                <select 
                  required 
                  value={formData.plan_id}
                  onChange={(e) => setFormData({...formData, plan_id: e.target.value})}
                  className="w-full border border-gray-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                >
                  <option value="">-- Pilih Paket --</option>
                  {plans.map(plan => (
                    <option key={plan.plan_id} value={plan.plan_id}>
                      {plan.plan_name} - Rp {plan.price.toLocaleString('id-ID')} ({plan.duration_months} bulan)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  required 
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status Pembayaran <span className="text-red-500">*</span>
                </label>
                <select 
                  value={formData.payment_status}
                  onChange={(e) => setFormData({...formData, payment_status: e.target.value})}
                  className="w-full border border-gray-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                >
                  <option value="Paid">Paid (Lunas)</option>
                  <option value="Pending">Pending</option>
                </select>
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
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold shadow-md"
                >
                  Simpan Langganan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
