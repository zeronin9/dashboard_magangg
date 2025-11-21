'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { SubscriptionPlan } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function PlatformDashboard() {
  const { user, logout } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get('/subscription-plan');
        setPlans(res.data);
      } catch (error) {
        console.error("Gagal ambil data", error);
      }
    };
    fetchPlans();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Platform Dashboard</h1>
        <div className="flex gap-4 items-center">
           <span>Halo, {user?.name}</span>
           <button onClick={logout} className="text-red-500">Logout</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan, idx) => (
          <div key={idx} className="p-4 border rounded shadow bg-white">
            <h3 className="text-xl font-bold">{plan.plan_name}</h3>
            <p className="text-2xl text-blue-600 mt-2">Rp {plan.price.toLocaleString()}</p>
            <ul className="mt-4 text-sm text-gray-600">
              <li>Max Cabang: {plan.branch_limit}</li>
              <li>Durasi: {plan.duration_months} Bulan</li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}