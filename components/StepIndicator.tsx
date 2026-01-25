
import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = ['Serviço', 'Data & Hora', 'Confirmação'];
  
  return (
    <div className="max-w-md mx-auto flex justify-between mb-12 px-4 md:px-0">
      {steps.map((step, index) => (
        <div key={step} className="flex flex-col items-center flex-1 relative">
          {/* Linha conectora */}
          {index !== 0 && (
            <div className={`absolute top-5 -left-1/2 w-full h-[2px] -z-0 ${index <= currentStep ? 'bg-rose-200' : 'bg-gray-50'}`} />
          )}
          
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black mb-3 transition-all duration-500 relative z-10 ${
            index <= currentStep 
            ? 'bg-rose-500 text-white shadow-xl shadow-rose-200 scale-110' 
            : 'bg-white border-2 border-gray-50 text-gray-300'
          }`}>
            {index + 1}
          </div>
          <span className={`text-[9px] font-black uppercase tracking-[0.2em] text-center ${
            index <= currentStep ? 'text-rose-500' : 'text-gray-300'
          }`}>
            {step}
          </span>
        </div>
      ))}
    </div>
  );
};
