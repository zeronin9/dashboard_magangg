'use client';

import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api';
import { SubscriptionPlan } from '@/types';
import { Plus, Loader2, Package, Edit2 } from 'lucide-react';

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
          <Loader2 size={40} className="animate-spin text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data paket...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paket Langganan</h1>
          <p className="text-gray-600 mt-2 text-base">
            Kelola paket yang akan ditawarkan ke mitra
          </p>
        </div>
        <button 
          onClick={() => { 
            setEditingPlan(null); 
            resetForm(); 
            setIsModalOpen(true); 
          }}
          className="bg-gradient-to-r from-gray-100 to-gray-100 text-gray-800 px-6 py-3 rounded-xl hover:from-gray-200 hover:to-gray-200  border border-gray-400 transition font-semibold flex items-center gap-2 justify-center"
        >
          <Plus size={20} />
          Buat Paket Baru
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-200 text-center">
          <Package size={60} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Belum Ada Paket Langganan</h3>
          <p className="text-gray-500 mb-6">Buat paket langganan pertama untuk mitra Anda</p>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-gray-100 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-400 hover:text-white border border-gray-300 transition inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Buat Paket Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.plan_id} 
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all flex flex-col h-full"
            >
              {/* Content wrapper - flex-1 to push button to bottom */}
              <div className="flex-1 flex flex-col">
                {/* Header Card */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.plan_name}</h3>
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
                      {plan.duration_months} Bulan
                    </span>
                  </div>
                </div>
                
                {/* Price */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-3xl font-bold text-gray-800">
                    Rp {plan.price.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">per {plan.duration_months} bulan</p>
                </div>

                {/* Features - flex-1 to take remaining space */}
                <div className="flex-1">
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center text-sm text-gray-700">
                      <span className="text-green-500 mr-2">✓</span>
                      <span><strong>{plan.branch_limit}</strong> Cabang</span>
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <span className="text-green-500 mr-2">✓</span>
                      <span><strong>{plan.device_limit}</strong> Perangkat/Cabang</span>
                    </li>
                    {plan.description && (
                      <li className="text-xs text-gray-500 italic pt-2 border-t border-gray-100 mt-2">
                        {plan.description}
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Edit Button - always at bottom */}
              <button 
                onClick={() => openEdit(plan)}
                className="w-full px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition font-semibold text-sm flex items-center justify-center gap-2 border border-gray-200 mt-4"
              >
                <Edit2 size={16} />
                Edit Paket
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-8 py-6 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingPlan ? "Edit Paket" : "Buat Paket Baru"}
              </h2>
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
                  Nama Paket <span className="text-red-500">*</span>
                </label>
                <input 
                  required 
                  name="plan_name" 
                  value={formData.plan_name} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
                  placeholder="Contoh: Paket Premium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Harga (Rp) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  required 
                  name="price" 
                  value={formData.price} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
                  placeholder="1500000"
                  min="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Limit Cabang <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    required 
                    name="branch_limit" 
                    value={formData.branch_limit} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Limit Device <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    required 
                    name="device_limit" 
                    value={formData.device_limit} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
                    min="1"
                  />
                </div>
              </div>

              <div>
  <label className="block text-sm font-bold text-gray-700 mb-2">
    Durasi (Bulan) <span className="text-red-500">*</span>
  </label>
  <input 
    type="number" 
    required 
    name="duration_months" 
    value={formData.duration_months} 
    onChange={handleChange} 
    className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
    placeholder="Masukkan durasi dalam bulan (contoh: 12)"
    min="1"
    max="60"
  />
  <p className="text-xs text-gray-500 mt-1">
    Masukkan durasi dalam bulan (minimal 1 bulan, maksimal 60 bulan)
  </p>
</div>


              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
                  rows={3}
                  placeholder="Deskripsi singkat paket (opsional)"
                />
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
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-100 text-gray-700 rounded-xl hover:from-gray-300 hover:to-gray-300 transition font-bold border border-gray-400 "
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
