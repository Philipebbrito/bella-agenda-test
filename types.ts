
export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export enum SalonStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED'
}

export enum SubscriptionPlan {
  FREE = 'FREE',
  MONTHLY = 'MONTHLY',
  SEMI_ANNUAL = 'SEMI_ANNUAL',
  ANNUAL = 'ANNUAL'
}

export interface Salon {
  id: string;
  name: string;
  slug: string;
  status: SalonStatus;
  ownerEmail: string;
  ownerPhone: string;
  password?: string; // Campo de senha para fornecedores
  plan: SubscriptionPlan;
  createdAt: Date;
}

export interface BusinessHours {
  day: number; // 0-6 (Sunday-Saturday)
  label: string;
  isOpen: boolean;
  startTime: string;
  endTime: string;
}

export interface VendorSettings {
  salonId: string;
  mercadoPagoAccessToken: string;
  pixEnabled: boolean;
  businessName: string;
  availability: BusinessHours[];
  lastAvailabilityUpdate?: Date;
}

export interface BeautyService {
  id: string;
  salonId: string;
  name: string;
  category: string;
  description: string;
  price: number;
  durationMinutes: number;
  imageUrl: string;
  averageRating: number;
  reviewCount: number;
}

export interface Appointment {
  id: string;
  salonId: string;
  services: BeautyService[];
  userName: string;
  userPhone: string;
  professionalName: string;
  scheduledAt: Date;
  status: AppointmentStatus;
  totalAmount: number;
  depositAmount: number;
  remainingAmount: number;
  platformFee: number; // Taxa fixa de R$ 1,00
  createdAt: Date;
  expiresAt: Date;
  isSyncedWithGoogle?: boolean;
  pixCopyPaste?: string;
}
