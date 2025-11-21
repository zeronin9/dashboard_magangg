// --- User & Auth ---
export type UserRole = 'admin_platform' | 'super_admin' | 'branch_admin';

export interface User {
  name: string;
  role: UserRole;
  partnerId: string | null;
  branchId: string | null;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

// --- Admin Platform (L3) ---

export interface SubscriptionPlan {
  id?: string;
  plan_id?: string;
  plan_name: string;
  price: number;
  branch_limit: number;
  device_limit: number;
  duration_months: number;
  description: string;
}

export interface Partner {
  partner_id: string;
  business_name: string;
  business_email: string;
  business_phone: string;
  status: 'Active' | 'Suspended' | 'Inactive';
  joined_date: string;
}

export interface PartnerSubscription {
  subscription_id: string;
  partner_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  payment_status: 'Paid' | 'Unpaid' | 'Pending';
  status: 'Active' | 'Expired';
  plan_snapshot?: {
    plan_name: string;
    price: number;
  };
}

export interface License {
  license_id: string;
  partner_id: string;
  branch_id: string | null;
  activation_code: string;
  device_id: string | null;
  device_name: string | null;
  license_status: 'Active' | 'Assigned' | 'Pending';
  branch?: {
    branch_name: string;
  } | null;
}

// --- Admin Mitra (L2) ---

export interface Branch {
  branch_id: string;
  partner_id: string;
  branch_name: string;
  address: string;
  phone_number: string;
  tax_name?: string | null;
  tax_percentage?: number | null;
}