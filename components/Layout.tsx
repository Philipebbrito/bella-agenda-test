
import React from 'react';
import { ICONS } from '../constants';
import { Salon } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeSalon?: Salon | null;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeSalon }) => {
  return (
    <div className="min-h-screen bg-[#fafafa] flex justify-center">
      <div className="w-full max-w-6xl flex flex-col bg-white shadow-2xl md:my-8 md:rounded-[2.5rem] overflow-hidden relative border border-gray-100/50">
        <header className="px-6 py-8 md:px-12 md:py-10 border-b border-gray-50 bg-white sticky top-0 z-20">
          <div className="flex justify-between items-center">
            <div className="group cursor-default">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                {activeSalon ? (
                  <span className="serif">{activeSalon.name}</span>
                ) : (
                  <>Bella<span className="text-rose-500 transition-colors group-hover:text-rose-600">Agenda</span></>
                )}
              </h1>
              <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-[0.3em] font-medium mt-1">
                {activeSalon ? 'Agendamento Online' : 'Sua beleza em primeiro lugar'}
              </p>
            </div>
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-inner ${activeSalon ? 'bg-gray-900 text-white' : 'bg-rose-50 text-rose-500'}`}>
              <ICONS.BeautySparkle />
            </div>
          </div>
        </header>
        <main className="flex-1 px-6 py-8 md:px-12 md:py-12 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
