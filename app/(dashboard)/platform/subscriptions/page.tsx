'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { SubscriptionPlan } from '@/types';
import Modal from '@/components/ui/Modal';

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState({
    plan_name: '',
    price: 0,
    branch_limit: 1,
    device_limit: 1,
    duration_months: 12,
    description: ''
  });

  // Fetch Data
  const fetchPlans = async () => {
    try {
      const res = await api.get('/subscription-plan');
      setPlans(res.data);
    } catch (error) {
      alert('Gagal mengambil data paket');
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Handle Input Form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Submit (Create / Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Format angka
      const payload = {
        ...formData,
        price: Number(formData.price),
        branch_limit: Number(formData.branch_limit),
        device_limit: Number(formData.device_limit),
        duration_months: Number(formData.duration_months)
      };

      if (editingPlan) {
        // PUT Update
        // Asumsi ID ada di field id atau plan_id (sesuaikan dengan API response)
        const planId = editingPlan.id || editingPlan.plan_id;
        await api.put(`/subscription-plan/${planId}`, payload);
        alert('Paket berhasil diperbarui');
      } else {
        // POST Create
        await api.post('/subscription-plan', payload);
        alert('Paket berhasil dibuat');
      }
      setIsModalOpen(false);
      setEditingPlan(null);
      fetchPlans();
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const resetForm = () => {
    setFormData({
      plan_name: '', price: 0, branch_limit: 1, device_limit: 1, duration_months: 12, description: ''
    });
  };

  const openEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      plan_name: plan.plan_name,
      price: plan.price,
      branch_limit: plan.branch_limit,
      device_limit: plan.device_limit,
      duration_months: plan.duration_months,
      description: plan.description
    });
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Paket Langganan</h1>
        <button 
          onClick={() => { setEditingPlan(null); resetForm(); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Tambah Paket
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, idx) => (
          <div key={idx} className="bg-white p-6 rounded-lg shadow border hover:border-blue-500 transition">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-gray-900">{plan.plan_name}</h3>
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                {plan.duration_months} Bulan
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800 my-4">
              Rp {plan.price.toLocaleString('id-ID')}
            </p>
            <ul className="text-sm text-gray-600 space-y-2 mb-4">
              <li>✅ {plan.branch_limit} Cabang</li>
              <li>✅ {plan.device_limit} Perangkat</li>
              <li className="text-gray-500">"{plan.description}"</li>
            </ul>
            <button 
              onClick={() => openEdit(plan)}
              className="w-full mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Edit Paket
            </button>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingPlan ? "Edit Paket" : "Buat Paket Baru"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Nama Paket</label>
            <input required name="plan_name" value={formData.plan_name} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Harga (Rp)</label>
            <input type="number" required name="price" value={formData.price} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium">Limit Cabang</label>
              <input type="number" required name="branch_limit" value={formData.branch_limit} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium">Limit Device</label>
              <input type="number" required name="device_limit" value={formData.device_limit} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Durasi (Bulan)</label>
            <input type="number" required name="duration_months" value={formData.duration_months} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Deskripsi</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Simpan
          </button>
        </form>
      </Modal>
    </div>
  );
}