
import React from 'react';
import { ICONS } from '../constants';

interface FinancialStats {
  totalDepositNet: number;
  totalRemaining: number;
  totalProjected: number;
  platformFeesDeducted: number;
  count: number;
}

export const FinancialSummary: React.FC<{ stats: FinancialStats }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn mb-10">
      {/* Card: Lucro Líquido do Sinal */}
      <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm flex flex-col gap-4 group hover:border-rose-100 transition-all">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
            <ICONS.Wallet />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Sinal Líquido</p>
            <p className="text-xl font-black text-gray-900">R$ {stats.totalDepositNet.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
          <span className="text-[9px] text-gray-400 font-bold uppercase">Taxa BellaAgenda:</span>
          <span className="text-[9px] text-rose-500 font-black">- R$ {stats.platformFeesDeducted.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Card: Total a Receber */}
      <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm flex items-center gap-6 group hover:border-amber-100 transition-all">
        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
          <ICONS.Calendar />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">A Receber no Local</p>
          <p className="text-xl font-black text-gray-900">R$ {stats.totalRemaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Card: Receita Projetada */}
      <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-xl flex items-center gap-6">
        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-rose-400">
          <ICONS.TrendingUp />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Total Projetado</p>
          <p className="text-xl font-black text-white">R$ {stats.totalProjected.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Card: Volume */}
      <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm flex items-center gap-6">
        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
          <ICONS.CheckCircle />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Atendimentos</p>
          <p className="text-xl font-black text-gray-900">{stats.count}</p>
        </div>
      </div>
    </div>
  );
};
