'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/api';
import Link from 'next/link';
import { 
  DollarSign, Loader2, AlertCircle, Calendar, TrendingUp
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

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

      const partners = partnersData.status === 'fulfilled' 
        ? (Array.isArray(partnersData.value) ? partnersData.value : [])
        : [];
      
      const subscriptions = subscriptionsData.status === 'fulfilled' 
        ? subscriptionsData.value
        : { summary: {}, data: [] };
      
      const plans = plansData.status === 'fulfilled'
        ? (Array.isArray(plansData.value) ? plansData.value : [])
        : [];

      const activePartners = partners.filter((p: any) => p.status === 'Aktif').length;
      const suspendedPartners = partners.filter((p: any) => p.status === 'Ditangguhkan').length;

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

      const activeLicenses = allLicenses.filter((l: any) => l.license_status === 'Aktif').length;

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

  // Chart Data
  const chartData = [
    { 
      category: "Total Mitra", 
      value: stats.totalPartners,
      fill: "hsl(217, 91%, 60%)" // Blue
    },
    { 
        category: "Total Paket Langganan",        // DIUBAH dari "Total Langganan"
        value: stats.totalPlans,        // DIUBAH dari stats.totalSubscriptions
        fill: "hsl(45, 93%, 47%)"       // Tetap orange/amber
    },

    { 
      category: "Langganan Aktif", 
      value: stats.activeSubscriptions,
      fill: "hsl(142, 71%, 45%)" // Green
    },
    { 
      category: "Lisensi Aktif", 
      value: stats.activeLicenses,
      fill: "hsl(262, 83%, 58%)" // Purple
    },
    { 
      category: "Total Lisensi", 
      value: stats.totalLicenses,
      fill: "hsl(0, 65%, 60%)" // Pink
    },
  ];

  const chartConfig = {
    value: {
      label: "Total",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  return (
    <div className="pb-10">
      
      {/* HEADER - Padding konsisten */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-gray-600 text-base">
            Selamat Datang, <span className="font-bold text-gray-900">{username}</span>! Selamat dan Semangat Bekerja.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-sm font-medium text-gray-600">
          <Calendar size={18} className="text-gray-600"/>
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

          {/* BAR CHART - Platform Statistics dengan padding konsisten */}
          <Card className="border-2 shadow-sm">
            {/* Header dengan padding konsisten: p-6 */}
            <CardHeader className="p-6 pt-0 pb-0">
              <CardTitle className="text-2xl font-bold text-gray-900">Statistik Platform</CardTitle>
              {/* <CardDescription className="text-base text-gray-600 mt-2">
                Gambaran dari partners, subscriptions, dan licenses
              </CardDescription> */}
            </CardHeader>
            
            {/* Content dengan padding konsisten: p-6 */}
            <CardContent className="p-6 pt-0">
              <ChartContainer config={chartConfig} className="h-[335px] w-full">
                <BarChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 20,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="category"
                    tickLine={false}
                    tickMargin={15}
                    axisLine={false}
                    angle={0}
                    textAnchor="middle"
                    height={20}
                    tick={{ fontSize: 13, fontWeight: 500 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <ChartTooltip
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[12, 12, 0, 0]}
                  >
                    <LabelList
                      position="top"
                      offset={12}
                      className="fill-foreground"
                      fontSize={14}
                      fontWeight={700}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
            
            {/* Footer dengan padding konsisten: p-6 */}
            <CardFooter className="p-6 pb-0 border-t flex-col items-start gap-3">
              {/* <div className="flex gap-2 items-center leading-none font-bold text-base text-green-600">
                <TrendingUp className="h-5 w-5" />
                Platform berkembang dengan stabil
              </div> */}
              <div className="text-gray-600 leading-relaxed text-sm">
                Data Real-time yang menunjukkan total Mitra, langganan aktif, dan perangkat lisensi di seluruh platform.
              </div>
            </CardFooter>
          </Card>

        </>
      )}
    </div>
  );
}
