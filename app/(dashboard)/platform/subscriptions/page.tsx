'use client';

import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { Partner, SubscriptionPlan } from '@/types';
import { ShoppingBag, Plus, Search, Loader2, DollarSign, Users, Calendar, CheckCircle, Clock } from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    partner_id: '',
    plan_id: '',
    start_date: new Date().toISOString().split('T')[0],
    payment_status: 'Paid'
  });

  // Helper function untuk mendapatkan plan details
  const getPlanDetails = (subscription: SubscriptionData) => {
    // Prioritas 1: Gunakan plan_snapshot jika ada dan lengkap
    if (subscription.plan_snapshot?.plan_name && subscription.plan_snapshot?.price) {
      return {
        plan_name: subscription.plan_snapshot.plan_name,
        price: subscription.plan_snapshot.price,
        duration_months: subscription.plan_snapshot.duration_months
      };
    }
    
    // Prioritas 2: Cari dari state plans menggunakan plan_id
    const plan = plans.find(p => p.plan_id === subscription.plan_id);
    if (plan) {
      return {
        plan_name: plan.plan_name,
        price: plan.price,
        duration_months: plan.duration_months
      };
    }
    
    // Fallback
    return {
      plan_name: 'N/A',
      price: 0,
      duration_months: 0
    };
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load plans FIRST (penting untuk fallback mapping)
      const plansData = await fetchWithAuth('/subscription-plan');
      const allPlans = Array.isArray(plansData) ? plansData : [];
      setPlans(allPlans);
      
      // Kemudian load subscriptions dan partners
      const [subsData, partnersData] = await Promise.all([
        fetchWithAuth('/partner-subscription'),
        fetchWithAuth('/partner'),
      ]);

      // Set subscriptions data
      if (subsData && typeof subsData === 'object') {
        const subscriptionsArray = Array.isArray(subsData.data) ? subsData.data : [];
        
        // Debug: Log data pertama untuk melihat struktur
        if (subscriptionsArray.length > 0) {
          console.log('📊 Sample Subscription Data:', subscriptionsArray[0]);
          console.log('📦 Available Plans:', allPlans);
        }
        
        setSubscriptions(subscriptionsArray);
        setSummary(subsData.summary || { 
          total_subscriptions_record: 0, 
          currently_active_partners: 0, 
          total_revenue: '0' 
        });
      } else {
        setSubscriptions([]);
      }

      setPartners(Array.isArray(partnersData) ? partnersData : []);
      
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      setSubscriptions([]);
      setPartners([]);
      setPlans([]);
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

      if (!payload.partner_id || !payload.plan_id || !payload.start_date) {
        alert('Partner ID, Plan ID, dan tanggal mulai wajib diisi');
        return;
      }

      const response = await fetchWithAuth('/partner-subscription', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (response) {
        alert('Langganan berhasil ditambahkan!');
        setIsModalOpen(false);
        loadData();
        resetForm();
      }
      
    } catch (error: any) {
      if (error.message) {
        alert(error.message);
      } else {
        alert('Gagal menambahkan langganan. Pastikan semua data terisi dengan benar.');
      }
      console.error('Subscription error:', error);
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

  const filteredSubscriptions = subscriptions.filter(sub => {
    const planDetails = getPlanDetails(sub);
    return (
      sub.partner?.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      planDetails.plan_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="pb-10">
      
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Langganan Mitra</h1>
          <p className="text-gray-600 mt-2 text-base">
            Kelola penugasan langganan dan lacak pendapatan
          </p>
        </div>
      </div>

      
      {/* SUBSCRIPTIONS TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Bar */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari berdasarkan mitra atau paket..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-gray-100 to-gray-100 text-gray-800 px-6 py-3 rounded-xl hover:from-gray-200 hover:to-gray-200  border border-gray-400 transition font-semibold flex items-center gap-2 justify-center"
            >
              <Plus size={20} />
              Tetapkan Langganan Baru
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-500">Memuat langganan...</p>
            </div>
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={60} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-4">
              {searchTerm ? 'Tidak ada langganan yang ditemukan' : 'Belum ada transaksi langganan'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gray-100 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-400 hover:text-white border border-gray-300 transition inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Buat Langganan Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Mitra</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Paket</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Harga</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Periode</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Pembayaran</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscriptions.map((sub) => {
                  const planDetails = getPlanDetails(sub);
                  
                  return (
                    <tr key={sub.subscription_id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-5 whitespace-nowrap font-semibold text-gray-900">
                        {sub.partner?.business_name || 'N/A'}
                      </td>
                      <td className="px-6 py-5">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {planDetails.plan_name}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Calendar size={12} />
                            {planDetails.duration_months} bulan
                          </div>
                          {/* Debug info - bisa dihapus setelah berhasil */}
                          <div className="text-xs text-gray-400 mt-1">
                            Plan ID: {sub.plan_id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap font-bold text-gray-900">
                        Rp {planDetails.price.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm">
                          <div className="text-gray-900 font-medium">
                            {new Date(sub.start_date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            s/d {new Date(sub.end_date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${
                          sub.payment_status === 'Paid' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {sub.payment_status === 'Paid' ? <CheckCircle size={14} /> : <Clock size={14} />}
                          {sub.payment_status === 'Paid' ? 'Lunas' : 'Upgraded'}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`px-4 py-2 rounded-full text-xs font-bold ${
                          sub.payment_status === 'Paid' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {sub.payment_status === 'Paid' ? 'Aktif' : 'Tidak Aktif'}
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

      {/* MODAL - sama seperti sebelumnya */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-8 py-6 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-800">Tetapkan Langganan Baru</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition text-3xl leading-none"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Pilih Mitra <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.partner_id}
                  onChange={(e) => setFormData({...formData, partner_id: e.target.value})}
                  className="w-full border border-gray-300 p-4 rounded-xl bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
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
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Pilih Paket <span className="text-red-500">*</span>
                </label>
                <select 
                  required 
                  value={formData.plan_id}
                  onChange={(e) => setFormData({...formData, plan_id: e.target.value})}
                  className="w-full border border-gray-300 p-4 rounded-xl bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
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
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  required 
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Status Pembayaran <span className="text-red-500">*</span>
                </label>
                <select 
                  value={formData.payment_status}
                  onChange={(e) => setFormData({...formData, payment_status: e.target.value})}
                  className="w-full border border-gray-300 p-4 rounded-xl bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                >
                  <option value="Paid">Lunas</option>
                  <option value="Pending">Menunggu</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Catatan:</strong> Tanggal selesai akan dihitung otomatis berdasarkan durasi paket yang dipilih.
                </p>
              </div>

              <div className="flex space-x-3 pt-5">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-bold border border-gray-400"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-100 text-gray-800 rounded-xl hover:from-gray-200 hover:to-gray-200 transition font-bold border border-gray-400"
                >
                  Tetapkan Langganan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
