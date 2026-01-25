
import { supabase } from '../supabaseClient';
import { Appointment, AppointmentStatus, BeautyService, SubscriptionPlan, VendorSettings, BusinessHours, Salon, SalonStatus } from '../types';

const PLATFORM_FIXED_FEE = 1.00;

export const mockBackend = {
  // Super Admin Methods
  getAllSalons: async () => {
    const { data, error } = await supabase.from('salons').select('*');
    if (error) throw error;
    return data as Salon[];
  },
  
  updateSalonStatus: async (id: string, status: SalonStatus) => {
    const { error } = await supabase.from('salons').update({ status }).eq('id', id);
    if (error) throw error;
    return true;
  },

  deleteSalon: async (id: string) => {
    const { error } = await supabase.from('salons').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  loginSuperAdmin: async (email: string, password?: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: password || '',
    });
    
    if (error) throw error;
    
    // Verifica se o usuário tem permissão de admin (Simulado via metadata ou tabela fixa)
    // No Supabase real, você usaria Custom Claims ou uma tabela de roles
    if (email === 'admin@bellaagenda.com') {
      return { id: data.user.id, role: 'SUPER_ADMIN' };
    }
    throw new Error('Você não tem permissões administrativas.');
  },

  getPlatformGlobalStats: async () => {
    const { count: aptCount } = await supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'CONFIRMED');
    const { count: salonCount } = await supabase.from('salons').select('*', { count: 'exact', head: true }).eq('status', 'APPROVED');
    
    return {
      totalAppointments: aptCount || 0,
      platformProfit: (aptCount || 0) * PLATFORM_FIXED_FEE,
      activeSalons: salonCount || 0
    };
  },

  // Auth Methods (Vendor)
  loginVendor: async (email: string, password?: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: password || '',
    });

    if (error) throw error;

    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('*')
      .eq('owner_id', data.user.id)
      .single();

    if (salonError || !salon) throw new Error('Salão não encontrado para este usuário.');
    
    if (salon.status === SalonStatus.PENDING) throw new Error('Seu salão ainda está em fase de análise.');
    if (salon.status === SalonStatus.SUSPENDED) throw new Error('Seu acesso foi suspenso temporariamente.');
    
    return salon as Salon;
  },

  recoverPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return true;
  },

  // Services CRUD
  getServicesBySalon: async (salonId: string) => {
    const { data, error } = await supabase.from('services').select('*').eq('salon_id', salonId);
    if (error) throw error;
    return data as BeautyService[];
  },
  
  saveService: async (service: Partial<BeautyService>) => {
    if (service.id) {
      const { error } = await supabase.from('services').update(service).eq('id', service.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('services').insert([service]);
      if (error) throw error;
    }
    return true;
  },

  deleteService: async (id: string) => {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // Settings & Availability
  getSettings: async (salonId: string) => {
    const { data, error } = await supabase.from('vendor_settings').select('*').eq('salon_id', salonId).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data as VendorSettings;
  },

  updateSettings: async (salonId: string, settings: Partial<VendorSettings>) => {
    const { error } = await supabase.from('vendor_settings').upsert({ salon_id: salonId, ...settings });
    if (error) throw error;
    return true;
  },

  findSalonBySlug: async (slug: string) => {
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'APPROVED')
      .single();
    
    if (error) return null;
    return data as Salon;
  },
  
  registerSalon: async (data: any) => {
    // 1. Criar usuário no Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) throw authError;

    // 2. Criar registro do salão vinculado ao owner_id
    const { data: salon, error: salonError } = await supabase.from('salons').insert([{
      name: data.name,
      slug: data.slug,
      owner_id: authData.user?.id,
      owner_email: data.email,
      owner_phone: data.phone,
      status: 'PENDING',
      plan: 'MONTHLY'
    }]).select().single();

    if (salonError) throw salonError;
    return salon as Salon;
  },

  createAppointment: async (salonId: string, data: any): Promise<Appointment> => {
    const totalAmount = data.services.reduce((acc: number, s: any) => acc + s.price, 0);
    const depositAmount = totalAmount * 0.3;

    const { data: apt, error } = await supabase.from('appointments').insert([{
      salon_id: salonId,
      user_name: data.userName,
      user_phone: data.userPhone,
      scheduled_at: data.scheduledAt,
      status: 'PENDING',
      total_amount: totalAmount,
      deposit_amount: depositAmount,
      remaining_amount: totalAmount - depositAmount,
      platform_fee: PLATFORM_FIXED_FEE,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    }]).select().single();

    if (error) throw error;

    // Fix: properly map keys before returning to match Appointment interface
    return {
      id: apt.id,
      salonId: apt.salon_id,
      userName: apt.user_name,
      userPhone: apt.user_phone,
      professionalName: data.professionalName || 'Profissional do Salão',
      scheduledAt: new Date(apt.scheduled_at),
      status: apt.status as AppointmentStatus,
      totalAmount: apt.total_amount,
      depositAmount: apt.deposit_amount,
      remainingAmount: apt.remaining_amount,
      platformFee: apt.platform_fee,
      createdAt: new Date(apt.created_at),
      expiresAt: new Date(apt.expires_at),
      services: data.services,
      pixCopyPaste: "00020126360014BR.GOV.BCB.PIX0114+55119999999995204000053039865405" + Math.random().toString(36).substring(7)
    } as Appointment;
  },

  getConfirmedAppointments: async (salonId: string) => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('salon_id', salonId)
      .eq('status', 'CONFIRMED')
      .order('scheduled_at', { ascending: true });
    
    if (error) throw error;
    
    // Fix: map database snake_case fields to camelCase properties for the Appointment interface
    return (data || []).map(apt => ({
      id: apt.id,
      salonId: apt.salon_id,
      userName: apt.user_name,
      userPhone: apt.user_phone,
      professionalName: apt.professional_name || 'Profissional',
      scheduledAt: new Date(apt.scheduled_at),
      status: apt.status as AppointmentStatus,
      totalAmount: Number(apt.total_amount),
      depositAmount: Number(apt.deposit_amount),
      remainingAmount: Number(apt.remaining_amount),
      platformFee: Number(apt.platform_fee),
      createdAt: new Date(apt.created_at),
      expiresAt: new Date(apt.expires_at),
      services: [] // Mocking empty services array for confirmed view
    })) as Appointment[];
  },

  confirmPayment: async (id: string) => {
    const { error } = await supabase.from('appointments').update({ status: 'CONFIRMED' }).eq('id', id);
    if (error) return { success: false };
    return { success: true };
  },

  getFinancialStats: async (salonId: string) => {
    const { data, error } = await supabase
      .from('appointments')
      .select('deposit_amount, total_amount, remaining_amount')
      .eq('salon_id', salonId)
      .eq('status', 'CONFIRMED');

    if (error) throw error;

    const stats = (data || []).reduce((acc, apt) => ({
      totalDepositNet: acc.totalDepositNet + Number(apt.deposit_amount) - PLATFORM_FIXED_FEE,
      totalRemaining: acc.totalRemaining + Number(apt.remaining_amount),
      totalProjected: acc.totalProjected + Number(apt.total_amount),
      platformFeesDeducted: acc.platformFeesDeducted + PLATFORM_FIXED_FEE,
      count: acc.count + 1
    }), { totalDepositNet: 0, totalRemaining: 0, totalProjected: 0, platformFeesDeducted: 0, count: 0 });

    return stats;
  }
};
