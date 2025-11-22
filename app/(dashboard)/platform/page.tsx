'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/api';
import Link from 'next/link';
import { 
  Store, ShoppingBag, TicketPercent, 
  Smartphone, BarChart3, DollarSign, 
  ArrowRight, Calendar, Loader2, AlertCircle, Users, Package
} from 'lucide-react';

interface DashboardStats {
  totalPartners: number;
  activePartners: number;
  suspendedPartners: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalRevenue: number;
  totalPlans: number;
  totalLicenses: number;
  activeLicenses: number;
}

interface QuickActionItem {
  title: string;
  subtitle: string;
  icon: any;
  href: string;
  color: string;
  bg: string;
}

export default function PlatformDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPartners: 0,
    activePartners: 0,
    suspendedPartners: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    totalPlans: 0,
    totalLicenses: 0,
    activeLicenses: 0,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('Admin Platform');

  useEffect(() => {
    // Get username from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        if (userObj.name || userObj.username) {
          setUsername(userObj.name || userObj.username);
        }
      } catch (e) {
        // Ignore
      }
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [partnersData, subscriptionsData, plansData] = await Promise.allSettled([
        fetchWithAuth('/partner'),
        fetchWithAuth('/partner-subscription'),
        fetchWithAuth('/subscription-plan'),
      ]);

      // Extract data safely
      const partners = partnersData.status === 'fulfilled' 
        ? (Array.isArray(partnersData.value) ? partnersData.value : [])
        : [];
      
      const subscriptions = subscriptionsData.status === 'fulfilled' 
        ? subscriptionsData.value
        : { summary: {}, data: [] };
      
      const plans = plansData.status === 'fulfilled'
        ? (Array.isArray(plansData.value) ? plansData.value : [])
        : [];

      // Calculate stats
      const activePartners = partners.filter((p: any) => p.status === 'Active').length;
      const suspendedPartners = partners.filter((p: any) => p.status === 'Suspended').length;

      // Get all licenses from all partners
      let allLicenses: any[] = [];
      try {
        const licensePromises = partners.map((p: any) => 
          fetchWithAuth(`/license/partner/${p.partner_id}`).catch(() => [])
        );
        const licenseResults = await Promise.all(licensePromises);
        allLicenses = licenseResults.flat();
      } catch (err) {
        console.error('Error fetching licenses:', err);
      }

      const activeLicenses = allLicenses.filter((l: any) => l.license_status === 'Active').length;

      setStats({
        totalPartners: partners.length,
        activePartners: activePartners,
        suspendedPartners: suspendedPartners,
        totalSubscriptions: subscriptions?.summary?.total_subscriptions_record || 0,
        activeSubscriptions: subscriptions?.summary?.currently_active_partners || 0,
        totalRevenue: parseInt(subscriptions?.summary?.total_revenue || '0'),
        totalPlans: plans.length,
        totalLicenses: allLicenses.length,
        activeLicenses: activeLicenses,
      });

    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatRp = (val: number) => 
    'Rp ' + parseInt(val.toString() || '0').toLocaleString('id-ID');

  const quickActions: QuickActionItem[] = [
    { 
      title: 'Partner Management', 
      subtitle: `${stats.totalPartners} Partners`, 
      icon: Users, 
      href: '/platform/partners', 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      title: 'Subscription Plans', 
      subtitle: `${stats.totalPlans} Packages`, 
      icon: Package, 
      href: '/platform/subscription-plans', 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50' 
    },
    { 
      title: 'Partner Subscriptions', 
      subtitle: `${stats.activeSubscriptions} Active`, 
      icon: ShoppingBag, 
      href: '/platform/subscriptions', 
      color: 'text-orange-600', 
      bg: 'bg-orange-50' 
    },
    { 
      title: 'License Monitor', 
      subtitle: `${stats.activeLicenses} Devices Online`, 
      icon: Smartphone, 
      href: '/platform/licenses', 
      color: 'text-purple-600', 
      bg: 'bg-purple-50' 
    },
  ];

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      
      {/* HEADER */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-2 text-base">
            Welcome back, <span className="font-bold text-gray-800">{username}</span>! Here's your platform summary.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-sm font-medium text-gray-600">
          <Calendar size={18} className="text-blue-600"/>
          {new Date().toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* LOADING STATE */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-gray-200">
          <Loader2 size={40} className="animate-spin text-blue-600 mb-3" />
          <p className="text-gray-500">Loading dashboard metrics...</p>
        </div>
      ) : (
        <>
          {/* ERROR MESSAGE */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle size={20} /> {error}
            </div>
          )}

          {/* KEY METRICS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            
            {/* MAIN CARD: TOTAL REVENUE */}
            <div className="lg:col-span-2 bg-gradient-to-r from-blue-600 to-blue-800 p-8 rounded-2xl text-white shadow-xl shadow-blue-200 relative overflow-hidden group transition-transform hover:scale-[1.01]">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
              
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                    <DollarSign size={32} className="text-white" />
                  </div>
                  <span className="bg-blue-500/50 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                    TOTAL REVENUE
                  </span>
                </div>
                <div>
                  <h3 className="text-5xl font-bold tracking-tight mb-2">
                    {formatRp(stats.totalRevenue)}
                  </h3>
                  <p className="text-blue-100 text-lg">
                    From <strong>{stats.totalSubscriptions}</strong> subscription transactions across all partners.
                  </p>
                </div>
              </div>
            </div>

            {/* SECONDARY STATS */}
            <div className="flex flex-col gap-6">
              {/* Partners Card */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 h-full hover:shadow-md transition-shadow">
                <div className="p-4 bg-orange-50 text-orange-600 rounded-xl">
                  <Users size={32} />
                </div>
                <div>
                  <p className="text-gray-500 font-medium text-sm">Total Partners</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.totalPartners}</h3>
                  <p className="text-xs text-green-600 font-semibold mt-1">
                    {stats.activePartners} Active
                  </p>
                </div>
              </div>

              {/* Licenses Card */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 h-full hover:shadow-md transition-shadow">
                <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
                  <Smartphone size={32} />
                </div>
                <div>
                  <p className="text-gray-500 font-medium text-sm">Active Licenses</p>
                  <div className="flex items-center gap-2">
                    <h3 className="text-3xl font-bold text-gray-900">{stats.activeLicenses}</h3>
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                      Online
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12">
              {quickActions.map((item, index) => (
                <Link href={item.href} key={index} className="group block h-full">
                  <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 h-full flex flex-col justify-between relative overflow-hidden">
                    
                    {/* Hover Effect */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-4 rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                        <item.icon size={32} />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <ArrowRight size={20} />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-gray-500 font-medium mt-2">{item.subtitle}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ADDITIONAL STATS SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <BarChart3 size={24} className="text-green-600" />
                </div>
                <span className="text-sm font-bold text-green-600">Active</span>
              </div>
              <h4 className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</h4>
              <p className="text-sm text-gray-600 mt-1">Active Subscriptions</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Package size={24} className="text-blue-600" />
                </div>
                <span className="text-sm font-bold text-blue-600">Available</span>
              </div>
              <h4 className="text-2xl font-bold text-gray-900">{stats.totalPlans}</h4>
              <p className="text-sm text-gray-600 mt-1">Subscription Plans</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Smartphone size={24} className="text-purple-600" />
                </div>
                <span className="text-sm font-bold text-purple-600">Total</span>
              </div>
              <h4 className="text-2xl font-bold text-gray-900">{stats.totalLicenses}</h4>
              <p className="text-sm text-gray-600 mt-1">Total Licenses</p>
            </div>
          </div>

        </>
      )}
    </div>
  );
}
