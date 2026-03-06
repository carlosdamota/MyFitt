import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "../../ui/Button";

interface CtaSectionProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
}

export const CtaSection: React.FC<CtaSectionProps> = ({ isLoggedIn, onLoginClick }) => {
  return (
    <section className='rounded-3xl border border-slate-200 dark:border-surface-800 bg-white/60 dark:bg-surface-900/60 p-8 md:p-10 text-center transition-colors'>
      <h2 className='text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 transition-colors'>
        Listo para entrenar en serio
      </h2>
      <p className='text-slate-500 dark:text-slate-300 max-w-2xl mx-auto mb-6'>
        Abre FITTWIZ, crea tu plan y empieza hoy. Menos dudas, más acción.
      </p>
      <Button
        size='lg'
        onClick={onLoginClick}
        className='px-8 py-4 h-auto text-lg'
        rightIcon={<ArrowRight size={18} />}
      >
        {isLoggedIn ? "Ir al panel" : "Crear mi cuenta"}
      </Button>
    </section>
  );
};
