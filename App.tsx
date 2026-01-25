
import React, { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { StepIndicator } from './components/StepIndicator';
import { CheckoutView } from './components/CheckoutView';
import { FinancialSummary } from './components/FinancialSummary';
import { ICONS, DEFAULT_SERVICE_IMAGE, PREDEFINED_GALLERY } from './constants';
import { Appointment, BeautyService, Salon, SalonStatus, SubscriptionPlan, VendorSettings } from './types';
import { mockBackend } from './services/mockApi';

const App: React.FC = () => {
  // Navigation State
  const [view, setView] = useState<'landing' | 'customer' | 'partner-onboarding' | 'vendor-login' | 'admin-login' | 'staff' | 'super-admin' | '404'>('landing');
  const [activeSalon, setActiveSalon] = useState<Salon | null>(null);
  const [authenticatedSalon, setAuthenticatedSalon] = useState<Salon | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [staffTab, setStaffTab] = useState<'financial' | 'services' | 'availability'>('financial');
  
  // App Logic States
  const [step, setStep] = useState(0);
  const [services, setServices] = useState<BeautyService[]>([]);
  const [cart, setCart] = useState<BeautyService[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGeneratingIA, setIsGeneratingIA] = useState(false);
  const [allSalons, setAllSalons] = useState<Salon[]>([]);
  const [globalStats, setGlobalStats] = useState({ totalAppointments: 0, platformProfit: 0, activeSalons: 0 });
  const [staffStats, setStaffStats] = useState({ totalDepositNet: 0, totalRemaining: 0, totalProjected: 0, platformFeesDeducted: 0, count: 0 });
  const [confirmedAppointments, setConfirmedAppointments] = useState<Appointment[]>([]);
  const [vendorSettings, setVendorSettings] = useState<VendorSettings | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [paymentDone, setPaymentDone] = useState(false);

  // Editing state
  const [editingService, setEditingService] = useState<Partial<BeautyService> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [onboardingData, setOnboardingData] = useState({ name: '', slug: '', email: '', phone: '', password: '', confirmPassword: '' });

  useEffect(() => {
    const init = async () => {
      const pathname = window.location.pathname;
      if (pathname !== '/' && pathname !== '') {
        const slug = pathname.replace('/', '');
        const salon = await mockBackend.findSalonBySlug(slug);
        if (salon) {
          handleSalonSelect(salon);
        }
      }
      const salons = await mockBackend.getAllSalons();
      setAllSalons(salons.filter(s => s.status === SalonStatus.APPROVED));
    };
    init();
  }, []);

  useEffect(() => {
    if (view === 'super-admin') refreshSuperAdminData();
    if (view === 'staff' && authenticatedSalon) loadStaffData();
  }, [view, authenticatedSalon]);

  const loadStaffData = async () => {
    if (!authenticatedSalon) return;
    setLoading(true);
    const [stats, svcs, sett, appts] = await Promise.all([
      mockBackend.getFinancialStats(authenticatedSalon.id),
      mockBackend.getServicesBySalon(authenticatedSalon.id),
      mockBackend.getSettings(authenticatedSalon.id),
      mockBackend.getConfirmedAppointments(authenticatedSalon.id)
    ]);
    setStaffStats(stats);
    setServices(svcs);
    setVendorSettings(sett);
    setConfirmedAppointments(appts);
    setLoading(false);
  };

  const handleGenerateDescriptionIA = async () => {
    if (!editingService?.name) {
      alert("Por favor, dê um nome ao serviço primeiro.");
      return;
    }

    setIsGeneratingIA(true);
    try {
      const response = await fetch('/.netlify/functions/gemini-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceName: editingService.name })
      });

      if (!response.ok) throw new Error("Erro ao consultar assistente de IA");
      
      const data = await response.json();
      setEditingService(prev => ({ ...prev, description: data.text }));
    } catch (error) {
      console.error("Erro IA:", error);
      alert("Não foi possível gerar a descrição agora. Tente novamente.");
    } finally {
      setIsGeneratingIA(false);
    }
  };

  const refreshSuperAdminData = async () => {
    const [salons, stats] = await Promise.all([
      mockBackend.getAllSalons(),
      mockBackend.getPlatformGlobalStats()
    ]);
    setAllSalons(salons);
    setGlobalStats(stats);
  };

  const handleSalonSelect = async (salon: Salon) => {
    setActiveSalon(salon);
    const svcs = await mockBackend.getServicesBySalon(salon.id);
    setServices(svcs);
    setStep(0);
    setView('customer');
  };

  const handleVendorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    try {
      const salon = await mockBackend.loginVendor(loginEmail, loginPassword);
      setAuthenticatedSalon(salon);
      setView('staff');
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    try {
      await mockBackend.loginSuperAdmin(adminEmail, adminPassword);
      setIsAdminAuthenticated(true);
      setView('super-admin');
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordRecovery = async () => {
    if (!loginEmail) {
      setLoginError('Digite seu e-mail para recuperar a senha.');
      return;
    }
    setLoading(true);
    try {
      await mockBackend.recoverPassword(loginEmail);
      alert('Um link de recuperação foi enviado para ' + loginEmail);
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthenticatedSalon(null);
    setIsAdminAuthenticated(false);
    setView('landing');
    window.history.pushState({}, '', '/');
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !authenticatedSalon) return;
    setLoading(true);
    await mockBackend.saveService({ ...editingService, salonId: authenticatedSalon.id });
    const svcs = await mockBackend.getServicesBySalon(authenticatedSalon.id);
    setServices(svcs);
    setEditingService(null);
    setLoading(false);
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Excluir este serviço permanentemente?')) return;
    await mockBackend.deleteService(id);
    if (authenticatedSalon) {
      const svcs = await mockBackend.getServicesBySalon(authenticatedSalon.id);
      setServices(svcs);
    }
  };

  const handleBooking = async () => {
    if (!activeSalon) return;
    setLoading(true);
    const apt = await mockBackend.createAppointment(activeSalon.id, {
      services: cart,
      userName,
      userPhone,
      scheduledAt: new Date(),
      professionalName: 'Profissional do Salão'
    });
    setAppointment(apt);
    setStep(2);
    setLoading(false);
  };

  const simulatePayment = async () => {
    if (!appointment) return;
    setLoading(true);
    await mockBackend.confirmPayment(appointment.id);
    setPaymentDone(true);
    setLoading(false);
  };

  const updateSalonStatus = async (id: string, status: SalonStatus) => {
    await mockBackend.updateSalonStatus(id, status);
    refreshSuperAdminData();
  };

  const deleteInadimplenteSalon = async (id: string) => {
    if (!confirm('ATENÇÃO: Deseja excluir permanentemente este fornecedor?')) return;
    setLoading(true);
    await mockBackend.deleteSalon(id);
    refreshSuperAdminData();
    setLoading(false);
  };

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (editingService) setEditingService({ ...editingService, imageUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  // --- RENDERS ---

  if (view === 'landing') {
    return (
      <Layout>
        <div className="py-20 text-center space-y-12 animate-fadeIn">
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-6xl font-black text-gray-900 serif leading-tight">
              A revolução do <span className="text-rose-500">Agendamento Online.</span>
            </h2>
            <p className="text-gray-400 text-xl font-medium">Garanta seu faturamento com pagamento antecipado de sinal.</p>
          </div>
          <div className="flex flex-col md:flex-row justify-center gap-6">
            <button onClick={() => setView('partner-onboarding')} className="bg-rose-500 text-white px-12 py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:scale-105 transition-all">Quero ser um Parceiro</button>
            <button onClick={() => setView('vendor-login')} className="bg-gray-900 text-white px-12 py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:scale-105 transition-all">Já sou Parceiro (Login)</button>
          </div>
          <div className="pt-24 space-y-10">
            <h3 className="text-xs font-black text-gray-300 uppercase tracking-[0.5em]">Explore Salões na Rede</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {allSalons.map(salon => (
                <div key={salon.id} onClick={() => handleSalonSelect(salon)} className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm hover:shadow-2xl cursor-pointer transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><ICONS.BeautySparkle /></div>
                  <h4 className="font-bold text-gray-900 text-xl serif">{salon.name}</h4>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-3">Ver Serviços e Agendar →</p>
                </div>
              ))}
            </div>
            <div className="pt-12">
               <button onClick={() => isAdminAuthenticated ? setView('super-admin') : setView('admin-login')} className="text-[9px] font-black text-gray-200 uppercase tracking-widest hover:text-gray-900 transition-colors">Acesso Restrito BellaAgenda</button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (view === 'admin-login') {
    return (
      <Layout>
        <div className="max-w-md mx-auto py-20 space-y-12 animate-fadeIn">
          <div className="text-center space-y-4">
             <div className="w-16 h-16 bg-gray-900 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6"><ICONS.Lock /></div>
             <h2 className="text-4xl font-black text-gray-900 serif">Plataforma Vision</h2>
          </div>
          <form onSubmit={handleAdminLogin} className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-xl space-y-6">
            <input required type="email" placeholder="admin@bellaagenda.com" className="w-full bg-gray-50 p-6 rounded-[2rem] outline-none" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
            <input required type="password" placeholder="••••••••" className="w-full bg-gray-50 p-6 rounded-[2rem] outline-none" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} />
            {loginError && <p className="text-[11px] font-bold text-rose-600">{loginError}</p>}
            <button disabled={loading} className="w-full py-6 bg-gray-900 text-white rounded-[2.5rem] font-black uppercase text-[10px] tracking-widest shadow-2xl">{loading ? 'Validando...' : 'Autenticar'}</button>
            <button type="button" onClick={() => setView('landing')} className="w-full text-gray-400 text-[10px] font-black uppercase">Voltar</button>
          </form>
        </div>
      </Layout>
    );
  }

  if (view === 'super-admin' && isAdminAuthenticated) {
    return (
      <Layout>
        <div className="space-y-10 animate-fadeIn">
          <div className="bg-gray-900 p-12 rounded-[4rem] text-white flex justify-between items-center shadow-2xl">
            <h2 className="text-4xl font-black serif">Vision <span className="text-rose-500">Platform</span></h2>
            <button onClick={handleLogout} className="bg-white/10 px-8 py-4 rounded-2xl text-[10px] font-black uppercase">Sair</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Transações</p>
                <p className="text-4xl font-black text-gray-900">{globalStats.totalAppointments}</p>
             </div>
             <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Lucro SaaS</p>
                <p className="text-4xl font-black text-gray-900">R$ {globalStats.platformProfit.toLocaleString('pt-BR')}</p>
             </div>
             <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ativos</p>
                <p className="text-4xl font-black text-gray-900">{globalStats.activeSalons}</p>
             </div>
          </div>
          <div className="bg-white rounded-[3.5rem] border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="p-8">Estabelecimento</th>
                    <th className="p-8">Proprietário</th>
                    <th className="p-8 text-right">Controle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {allSalons.map(salon => (
                    <tr key={salon.id}>
                      <td className="p-8 font-bold">{salon.name}</td>
                      <td className="p-8 text-xs">{salon.ownerEmail}</td>
                      <td className="p-8 text-right space-x-2">
                        {salon.status !== SalonStatus.APPROVED && <button onClick={() => updateSalonStatus(salon.id, SalonStatus.APPROVED)} className="px-4 py-2 bg-green-500 text-white text-[9px] font-black rounded-lg">Aprovar</button>}
                        <button onClick={() => deleteInadimplenteSalon(salon.id)} className="p-2 bg-rose-50 text-rose-600 rounded-lg"><ICONS.Trash /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (view === 'vendor-login') {
    return (
      <Layout>
        <div className="max-w-md mx-auto py-20 space-y-12 animate-fadeIn">
          <div className="text-center space-y-4">
             <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6"><ICONS.Lock /></div>
             <h2 className="text-4xl font-black text-gray-900 serif">Portal do Lojista</h2>
          </div>
          <form onSubmit={handleVendorLogin} className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-xl space-y-6">
            <input required type="email" placeholder="contato@seusalao.com" className="w-full bg-gray-50 p-6 rounded-[2rem] outline-none" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
            <input required type="password" placeholder="••••••••" className="w-full bg-gray-50 p-6 rounded-[2rem] outline-none" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
            {loginError && <p className="text-[11px] font-bold text-rose-600">{loginError}</p>}
            <button disabled={loading} className="w-full py-6 bg-gray-900 text-white rounded-[2.5rem] font-black uppercase text-[10px] tracking-widest">{loading ? 'Entrando...' : 'Entrar'}</button>
            <div className="flex flex-col gap-4 text-center">
              <button type="button" onClick={handlePasswordRecovery} className="text-[10px] font-black text-rose-500 uppercase">Esqueci minha senha</button>
              <button type="button" onClick={() => setView('landing')} className="text-gray-400 text-[10px] font-black uppercase">Voltar</button>
            </div>
          </form>
        </div>
      </Layout>
    );
  }

  if (view === 'staff' && authenticatedSalon) {
    return (
      <Layout activeSalon={authenticatedSalon}>
        <div className="space-y-10 animate-fadeIn">
          <div className="flex justify-between items-center">
             <h2 className="text-3xl font-black serif">Gestão</h2>
             <div className="flex gap-4">
                <button onClick={() => setStaffTab('financial')} className={`text-[11px] font-black uppercase tracking-widest ${staffTab === 'financial' ? 'text-rose-500' : 'text-gray-400'}`}>Financeiro</button>
                <button onClick={() => setStaffTab('services')} className={`text-[11px] font-black uppercase tracking-widest ${staffTab === 'services' ? 'text-rose-500' : 'text-gray-400'}`}>Catálogo</button>
                <button onClick={handleLogout} className="text-[10px] font-black text-rose-500 border border-rose-100 px-4 py-2 rounded-xl">Sair</button>
             </div>
          </div>

          {staffTab === 'services' && (
            <div className="space-y-8">
              <div className="bg-gray-50/50 p-8 rounded-[3rem] flex justify-between items-center">
                <h3 className="font-bold">Catálogo de Serviços</h3>
                <button onClick={() => setEditingService({ name: '', price: 0, category: 'Geral', durationMinutes: 60, imageUrl: DEFAULT_SERVICE_IMAGE, description: '' })} className="bg-gray-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase shadow-xl">Novo Serviço</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {services.map(s => (
                  <div key={s.id} className="bg-white border border-gray-100 rounded-[3rem] overflow-hidden group">
                    <div className="h-40 relative">
                       <img src={s.imageUrl} className="w-full h-full object-cover" />
                       <div className="absolute top-4 right-4 flex gap-2">
                          <button onClick={() => setEditingService(s)} className="p-3 bg-white/90 rounded-2xl"><ICONS.Edit /></button>
                          <button onClick={() => handleDeleteService(s.id)} className="p-3 bg-rose-500/90 rounded-2xl text-white"><ICONS.Trash /></button>
                       </div>
                    </div>
                    <div className="p-8">
                      <h4 className="font-bold text-xl serif">{s.name}</h4>
                      <p className="text-lg font-black mt-4">R$ {s.price.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {staffTab === 'financial' && (
            <div className="space-y-10">
              <FinancialSummary stats={staffStats} />
              <div className="bg-white rounded-[3.5rem] border border-gray-100 overflow-hidden">
                <div className="p-10 border-b border-gray-50"><h3 className="text-xl font-black serif">Agenda Confirmada</h3></div>
                {confirmedAppointments.map(apt => (
                  <div key={apt.id} className="p-8 border-b border-gray-50 flex justify-between items-center">
                    <div>
                      <p className="font-bold">{apt.userName}</p>
                      <p className="text-xs text-gray-400">{new Date(apt.scheduledAt).toLocaleString()}</p>
                    </div>
                    <span className="text-[10px] font-black px-4 py-1.5 rounded-full bg-green-50 text-green-600 border border-green-100 uppercase tracking-widest">Confirmado</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {editingService && (
          <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fadeIn">
            <div className="bg-white w-full max-w-4xl rounded-[4rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
               <div className="w-full md:w-1/2 p-12 space-y-8 overflow-y-auto">
                  <h3 className="text-3xl font-black serif">Editar Atendimento</h3>
                  <form onSubmit={handleSaveService} className="space-y-5">
                    <div className="space-y-1">
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Nome do Serviço</label>
                       <input required className="w-full bg-gray-50 p-5 rounded-2xl outline-none" placeholder="Ex: Progressiva" value={editingService.name} onChange={e => setEditingService({...editingService, name: e.target.value})} />
                    </div>
                    
                    <div className="space-y-1">
                       <div className="flex justify-between items-center px-4">
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Descrição</label>
                          <button type="button" onClick={handleGenerateDescriptionIA} disabled={isGeneratingIA} className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors flex items-center gap-1">
                             {isGeneratingIA ? 'IA Escrevendo...' : <><ICONS.BeautySparkle /> Gerar com IA</>}
                          </button>
                       </div>
                       <textarea className="w-full bg-gray-50 p-5 rounded-2xl outline-none min-h-[120px] text-sm resize-none" placeholder={isGeneratingIA ? "Aguarde, a IA está criando um texto incrível..." : "Descreva seu serviço..."} value={editingService.description} onChange={e => setEditingService({...editingService, description: e.target.value})} disabled={isGeneratingIA} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Preço (R$)</label>
                         <input required type="number" className="w-full bg-gray-50 p-5 rounded-2xl outline-none" placeholder="0,00" value={editingService.price} onChange={e => setEditingService({...editingService, price: Number(e.target.value)})} />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Minutos</label>
                         <input required type="number" className="w-full bg-gray-50 p-5 rounded-2xl outline-none" placeholder="60" value={editingService.durationMinutes} onChange={e => setEditingService({...editingService, durationMinutes: Number(e.target.value)})} />
                      </div>
                    </div>
                    
                    <button disabled={loading || isGeneratingIA} className="w-full py-6 bg-rose-500 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl hover:bg-rose-600 transition-all">{loading ? 'Salvando...' : 'Salvar Alterações'}</button>
                    <button type="button" onClick={() => setEditingService(null)} className="w-full text-gray-400 text-[10px] font-black uppercase">Cancelar</button>
                  </form>
               </div>
               <div className="w-full md:w-1/2 bg-gray-50 p-12 border-l border-gray-100 overflow-y-auto">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">Galeria de Imagens</h4>
                  <div className="grid grid-cols-2 gap-4">
                     <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer rounded-2xl border-4 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center h-28 opacity-60 hover:opacity-100 transition-all group">
                        <div className="text-gray-300 group-hover:text-rose-500 transition-colors"><ICONS.Camera /></div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleCustomImageUpload} />
                     </div>
                     {PREDEFINED_GALLERY.map(pic => (
                       <div key={pic.id} onClick={() => setEditingService({...editingService, imageUrl: pic.url})} className={`cursor-pointer rounded-2xl overflow-hidden border-4 transition-all h-28 ${editingService.imageUrl === pic.url ? 'border-rose-500' : 'border-transparent'}`}>
                          <img src={pic.url} className="w-full h-full object-cover" />
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}
      </Layout>
    );
  }

  if (view === 'customer' && activeSalon) {
    return (
      <Layout activeSalon={activeSalon}>
        <StepIndicator currentStep={step} />
        {step === 0 && (
          <div className="space-y-12">
            <h2 className="text-4xl font-black serif">Nossos Serviços</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {services.map(s => (
                <div key={s.id} onClick={() => { setCart([s]); setStep(1); }} className="group bg-white border border-gray-100 rounded-[3.5rem] overflow-hidden cursor-pointer hover:shadow-2xl transition-all">
                  <img src={s.imageUrl} className="w-full h-56 object-cover" />
                  <div className="p-10">
                    <h3 className="text-2xl font-bold serif">{s.name}</h3>
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">{s.description}</p>
                    <p className="text-xl font-black mt-4">R$ {s.price.toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="max-w-xl mx-auto space-y-10 text-center">
            <h3 className="text-4xl font-black serif">Reserva</h3>
            <div className="space-y-6">
               <input placeholder="Seu Nome Completo" className="w-full bg-gray-50 p-6 rounded-[2rem] outline-none" value={userName} onChange={e => setUserName(e.target.value)} />
               <input placeholder="Seu WhatsApp (00) 00000-0000" className="w-full bg-gray-50 p-6 rounded-[2rem] outline-none" value={userPhone} onChange={e => setUserPhone(e.target.value)} />
            </div>
            <button onClick={handleBooking} disabled={!userName || !userPhone} className="w-full py-7 bg-gray-900 text-white rounded-[2.5rem] font-black uppercase text-xs shadow-2xl hover:scale-[1.02] transition-all">Gerar Pix de Sinal</button>
          </div>
        )}
        {step === 2 && appointment && (
          <CheckoutView appointment={appointment} paymentDone={paymentDone} loading={loading} timeLeft={900} isExpired={false} simulatePayment={simulatePayment} resetBooking={() => setStep(0)} />
        )}
      </Layout>
    );
  }

  return <Layout><div className="flex items-center justify-center py-20 text-gray-400 font-bold uppercase tracking-widest animate-pulse">Carregando plataforma...</div></Layout>;
};

export default App;
