
import React, { useState, useEffect } from 'react';
import { Appointment } from '../types';
import { ICONS } from '../constants';

interface CheckoutViewProps {
  appointment: Appointment;
  paymentDone: boolean;
  loading: boolean;
  timeLeft: number;
  isExpired: boolean;
  simulatePayment: () => void;
  resetBooking: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  appointment,
  paymentDone,
  loading,
  timeLeft,
  isExpired,
  simulatePayment,
  resetBooking,
}) => {
  const [copied, setCopied] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [pixGenerated, setPixGenerated] = useState(false);

  const handleCopyPix = () => {
    if (appointment.pixCopyPaste) {
      navigator.clipboard.writeText(appointment.pixCopyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateGoogleCalendarLink = () => {
    const start = new Date(appointment.scheduledAt);
    const end = new Date(start.getTime() + (appointment.services[0]?.durationMinutes || 60) * 60000);
    
    const formatTime = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    
    const title = encodeURIComponent(`Agendamento BellaAgenda: ${appointment.services.map(s => s.name).join(', ')}`);
    const details = encodeURIComponent(
      `Olá ${appointment.userName}!\n\nSeu agendamento foi confirmado.\nValor Total: R$ ${appointment.totalAmount}\nSinal Pago: R$ ${appointment.depositAmount}\nSaldo a pagar no local: R$ ${appointment.remainingAmount}\n\nLocal: BellaAgenda Salon`
    );
    const dates = `${formatTime(start)}/${formatTime(end)}`;
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (paymentDone) {
    return (
      <div className="py-12 space-y-8 animate-fadeIn text-center">
        <div className="w-24 h-24 bg-green-500 rounded-[2.5rem] flex items-center justify-center text-white mx-auto shadow-2xl shadow-green-100 animate-bounce">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-gray-900 serif">Tudo Confirmado!</h2>
          <p className="text-sm text-gray-400 px-6 max-w-sm mx-auto font-medium">Seu horário foi reservado com sucesso. Te esperamos em breve!</p>
        </div>

        <div className="bg-gray-50/50 p-6 rounded-[2.5rem] border border-gray-100 max-w-sm mx-auto text-left space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-black uppercase tracking-widest">Protocolo:</span>
            <span className="text-gray-900 font-bold">#{appointment.id}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-black uppercase tracking-widest">Sinal Pago:</span>
            <span className="text-green-600 font-black">R$ {appointment.depositAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center text-xs border-t border-gray-200 pt-3">
            <span className="text-gray-400 font-black uppercase tracking-widest">Saldo no Local:</span>
            <span className="text-rose-500 font-black">R$ {appointment.remainingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 max-w-xs mx-auto">
          <a 
            href={generateGoogleCalendarLink()} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 py-5 bg-white border-2 border-gray-100 rounded-3xl font-black text-[10px] uppercase tracking-widest text-gray-700 hover:border-rose-200 transition-all shadow-sm active:scale-95"
          >
            <ICONS.Google />
            Sincronizar Google Agenda
          </a>
          
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-5 bg-gray-900 text-white rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl active:scale-95 transition-all"
          >
            Novo Agendamento
          </button>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="py-12 space-y-8 animate-fadeIn text-center">
        <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-rose-500 mx-auto border border-rose-100">
          <ICONS.Clock />
        </div>
        <h2 className="text-3xl font-black text-gray-900 serif">Tempo Expirado</h2>
        <p className="text-sm text-gray-400 px-6 font-medium">O tempo limite para o pagamento do sinal (15 min) esgotou. Sua pré-reserva foi liberada.</p>
        <button onClick={resetBooking} className="w-full max-w-xs py-6 bg-gray-900 text-white rounded-[2.5rem] font-black uppercase text-xs shadow-xl active:scale-95 transition-all">
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-10 animate-fadeIn pb-12">
      {/* Resumo do Agendamento */}
      <div className="bg-white border border-gray-100 rounded-[3rem] p-8 shadow-sm space-y-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
          <ICONS.Scissors />
        </div>
        
        <div className="space-y-1">
          <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Resumo da Escolha</p>
          <h3 className="text-2xl font-black text-gray-900 serif">Detalhes do Agendamento</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Serviço</p>
            <p className="text-xs font-bold text-gray-900 truncate">{appointment.services.map(s => s.name).join(', ')}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Profissional</p>
            <p className="text-xs font-bold text-gray-900">{appointment.professionalName}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Data e Hora</p>
            <p className="text-xs font-bold text-gray-900">
              {new Date(appointment.scheduledAt).toLocaleDateString('pt-BR')} às {new Date(appointment.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-amber-600 uppercase">
               <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
               Pendente
            </span>
          </div>
        </div>
      </div>

      {/* Cálculo de Valores */}
      <div className="bg-gray-900 rounded-[3rem] p-8 text-white shadow-2xl space-y-6 relative">
        <div className="flex justify-between items-center pb-4 border-b border-white/10">
           <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total dos Serviços</span>
           <span className="text-lg font-black">R$ {appointment.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
             <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-1">Reserva (30%)</p>
               <p className="text-xs text-gray-400 leading-none">Pague Agora</p>
             </div>
             <span className="text-2xl font-black text-rose-400">R$ {appointment.depositAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="flex justify-between items-center p-4">
             <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Saldo Final (70%)</p>
               <p className="text-xs text-gray-500 leading-none">Pagar no Salão</p>
             </div>
             <span className="text-xl font-black text-gray-300">R$ {appointment.remainingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl text-[10px] text-gray-400 font-medium italic border border-white/5">
           <ICONS.Info />
           <span>O valor da reserva é abatido do total no dia do atendimento.</span>
        </div>
      </div>

      {!pixGenerated ? (
        /* Etapa 1: Termos e Condições */
        <div className="space-y-8 animate-fadeIn">
          <div className="bg-white border border-gray-100 p-8 rounded-[3rem] shadow-sm">
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="relative mt-1">
                <input 
                  type="checkbox" 
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-6 h-6 border-2 border-gray-100 rounded-lg bg-gray-50 peer-checked:bg-rose-500 peer-checked:border-rose-500 transition-all flex items-center justify-center">
                  <ICONS.CheckCircle />
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-xs font-bold text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">
                  Li e concordo com a <span className="text-rose-500 underline">Política de Cancelamento</span>.
                </p>
                <p className="text-[10px] text-gray-400 font-medium">
                  Reservas canceladas com menos de 24h de antecedência não serão reembolsadas para cobrir custos operacionais.
                </p>
              </div>
            </label>
          </div>

          <button 
            disabled={!agreedToTerms}
            onClick={() => setPixGenerated(true)}
            className="w-full py-6 bg-gray-900 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl active:scale-95 transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <ICONS.Lock />
            Gerar Pix de Reserva
          </button>
        </div>
      ) : (
        /* Etapa 2: QR Code e Pagamento */
        <div className="space-y-8 animate-fadeIn text-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-amber-50 text-amber-600 rounded-full text-[11px] font-black uppercase tracking-widest border border-amber-100 shadow-sm">
              <ICONS.Clock />
              Pague em até {formatTime(timeLeft)}
            </div>
            <p className="text-xs text-gray-400 font-medium">Escaneie o QR Code abaixo ou copie a chave Pix.</p>
          </div>

          <div className="bg-white p-10 rounded-[4rem] shadow-2xl border border-gray-50 space-y-8 relative">
            <div className="bg-gray-50/50 p-6 rounded-3xl inline-block mx-auto border border-gray-100 relative group">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(appointment.pixCopyPaste || '')}`} 
                className="w-48 h-48 opacity-90 group-hover:opacity-100 transition-opacity" 
                alt="QR Code Pix" 
              />
              <div className="absolute inset-0 border-4 border-rose-500/10 rounded-3xl pointer-events-none"></div>
            </div>
            
            <button 
              onClick={handleCopyPix} 
              className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                copied ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {copied ? (
                <>
                  <ICONS.CheckCircle />
                  Código Copiado!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Copiar Pix Copia e Cola
                </>
              )}
            </button>
          </div>

          <div className="space-y-4 max-w-sm mx-auto">
            <button 
              onClick={simulatePayment} 
              disabled={loading} 
              className="w-full py-6 bg-rose-500 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all hover:bg-rose-600 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? 'Validando Pagamento...' : 'Já paguei meu Pix'}
            </button>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">A confirmação é instantânea</p>
          </div>
        </div>
      )}
    </div>
  );
};
