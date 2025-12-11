export type AppRole = 'admin' | 'moderator' | 'user';
export type AccountType = 'buyer' | 'provider';
export type GenderType = 'male' | 'female' | 'other';
export type DocumentStatus = 'pending' | 'approved' | 'rejected';
export type TransactionStatus = 'pending' | 'in_escrow' | 'confirmed' | 'refunded' | 'completed' | 'disputed';
export type Country = 'MZ' | 'AO';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  country: Country;
  gender?: GenderType;
  account_type?: AccountType;
  is_verified: boolean;
  is_adult_confirmed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  document_type: string;
  front_url?: string;
  back_url?: string;
  status: DocumentStatus;
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ProviderProfile {
  id: string;
  user_id: string;
  description?: string;
  age?: number;
  province?: string;
  services: string[];
  price_per_hour?: number;
  photos: string[];
  is_approved: boolean;
  is_visible: boolean;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  buyer_id: string;
  provider_id: string;
  amount: number;
  payment_method?: string;
  status: TransactionStatus;
  scheduled_at?: string;
  escrow_expires_at?: string;
  confirmed_at?: string;
  refunded_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Refund {
  id: string;
  transaction_id: string;
  reason: string;
  status: string;
  processed_at?: string;
  created_at: string;
}

// Registration flow types
export interface RegistrationData {
  fullName: string;
  phone: string;
  country: Country;
  isAdultConfirmed: boolean;
  frontDocumentFile?: File;
  backDocumentFile?: File;
}

export interface OnboardingState {
  step: 'welcome' | 'gender' | 'intent' | 'dashboard';
  gender?: GenderType;
  accountType?: AccountType;
}
