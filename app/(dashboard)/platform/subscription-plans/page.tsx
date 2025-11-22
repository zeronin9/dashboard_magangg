'use client';

import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { SubscriptionPlan } from '@/types';

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    plan_name: '',
    price: '',
    branch_limit: '',
    device_limit: '',
    duration_months: '',
    description: ''
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const data = await fetchWithAuth('/subscription-plan');
      setPlans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      alert('Gagal mengambil data paket');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        plan_name: formData.plan_name,
        price: Number(formData.price),
        branch_limit: Number(formData.branch_limit),
        device_limit: Number(formData.device_limit),
        duration_months: Number(formData.duration_months),
        description: formData.description
      };

      if (editingPlan) {
        await fetchWithAuth(`/subscription-plan/${editingPlan.plan_id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        alert('Paket berhasil diperbarui');
      } else {
        await fetchWithAuth('/subscription-plan', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        alert('Paket berhasil dibuat');
      }
      
      setIsModalOpen(false);
      setEditingPlan(null);
      fetchPlans();
      resetForm();
    } catch (error: any) {
      alert(error.message || 'Terjadi kesalahan');
    }
  };

  const resetForm = () => {
    setFormData({
      plan_name: '', 
      price: '', 
      branch_limit: '', 
      device_limit: '', 
      duration_months: '', 
      description: ''
    });
  };

  const openEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      plan_name: plan.plan_name,
      price: plan.price.toString(),
      branch_limit: plan.branch_limit.toString(),
      device_limit: plan.device_limit.toString(),
      duration_months: plan.duration_months.toString(),
      description: plan.description
    });
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data paket...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Paket Langganan</h1>
          <p className="text-gray-500 mt-1">Kelola paket yang akan ditawarkan ke mitra</p>
        </div>
        <button 
          onClick={() => { 
            setEditingPlan(null); 
            resetForm(); 
            setIsModalOpen(true); 
          }}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold shadow-md flex items-center space-x-2"
        >
          <span>+</span>
          <span>Buat Paket Baru</span>
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Belum Ada Paket Langganan</h3>
          <p className="text-gray-500 mb-6">Buat paket langganan pertama untuk mitra Anda</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
          >
            Buat Paket Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.plan_id} 
              className="bg-white p-6 rounded-xl shadow-md border-2 border-gray-200 hover:border-indigo-500 transition-all hover:shadow-xl"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{plan.plan_name}</h3>
                <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">
                  {plan.duration_months} Bulan
                </span>
              </div>
              
              <div className="mb-6">
                <p className="text-4xl font-bold text-indigo-600">
                  Rp {plan.price.toLocaleString('id-ID')}
                </p>
                <p className="text-sm text-gray-500 mt-1">per {plan.duration_months} bulan</p>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm text-gray-700">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span><strong>{plan.branch_limit}</strong> Cabang</span>
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <span className="text-green-500 mr-2 text-lg">✓</span>
                  <span><strong>{plan.device_limit}</strong> Perangkat per Cabang</span>
                </li>
                {plan.description && (
                  <li className="text-sm text-gray-500 italic pt-2 border-t">
                    {plan.description}
                  </li>
                )}
              </ul>

              <button 
                onClick={() => openEdit(plan)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
              >
                Edit Paket
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-800">
                {editingPlan ? "Edit Paket" : "Buat Paket Baru"}
              </h2>
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
                  Nama Paket <span className="text-red-500">*</span>
                </label>
                <input 
                  required 
                  name="plan_name" 
                  value={formData.plan_name} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Contoh: Paket Premium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Harga (Rp) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  required 
                  name="price" 
                  value={formData.price} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="1500000"
                  min="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Limit Cabang <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    required 
                    name="branch_limit" 
                    value={formData.branch_limit} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Limit Device <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    required 
                    name="device_limit" 
                    value={formData.device_limit} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Durasi (Bulan) <span className="text-red-500">*</span>
                </label>
                <select
                  required 
                  name="duration_months" 
                  value={formData.duration_months} 
                  onChange={(e) => setFormData({...formData, duration_months: e.target.value})} 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                >
                  <option value="">Pilih Durasi</option>
                  <option value="1">1 Bulan</option>
                  <option value="3">3 Bulan</option>
                  <option value="6">6 Bulan</option>
                  <option value="12">12 Bulan (1 Tahun)</option>
                  <option value="24">24 Bulan (2 Tahun)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  rows={3}
                  placeholder="Deskripsi singkat paket (opsional)"
                />
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
                  {editingPlan ? 'Update Paket' : 'Buat Paket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
