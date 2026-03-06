import React from "react";
import { PlanCard } from "../PlanCard";

interface PricingSectionProps {
  plan: string | null;
  onLoginClick: () => void;
  onUpgradeClick: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  plan,
  onLoginClick,
  onUpgradeClick,
}) => {
  return (
    <section
      className='mb-20'
      aria-labelledby='pricing-title'
    >
      <div className='flex items-end justify-between mb-8 flex-wrap gap-4'>
        <div>
          <p className='text-sm uppercase tracking-[0.2em] text-slate-500'>Planes</p>
          <h2
            id='pricing-title'
            className='text-3xl md:text-4xl font-bold text-slate-900 dark:text-white transition-colors'
          >
            Elige tu ritmo de entrenamiento
          </h2>
        </div>
        <p className='text-sm text-slate-400 max-w-md'>
          Empieza gratis y sube a Pro cuando quieras más IA y automatizaciones.
        </p>
      </div>
      <div className='grid md:grid-cols-2 gap-6'>
        <PlanCard
          title='Free'
          badge='Ideal para empezar'
          price='0 €'
          desc='Prueba el sistema y crea tus primeras rutinas.'
          features={[
            "1 Rutina IA al mes (2 días max)",
            "100 Logs de nutrición/mes",
            "Chat Coach (5 mensajes/mes)",
            "Seguimiento de progresos",
          ]}
          cta='Comenzar gratis'
          onClick={onLoginClick}
          tone='neutral'
        />
        <PlanCard
          title='Pro'
          badge='Oferta Lanzamiento'
          price={
            <span className='flex flex-col items-end leading-tight'>
              <span className='line-through text-slate-500 text-xs'>4.99 €</span>
              <span className='text-emerald-400 '>2.99 € / mes</span>
            </span>
          }
          desc='Programas completos con IA avanzada y análisis (Precio reducido por tiempo limitado).'
          features={[
            "5 Rutinas IA al mes (6 días)",
            "Nutrición Ilimitada + Fotos",
            "Chat Coach Ilimitado",
            "Análisis de progreso avanzado",
          ]}
          cta={plan === "pro" ? "Ir al panel (Ya eres Pro)" : "Desbloquear Oferta Pro"}
          onClick={onUpgradeClick}
          tone='accent'
        />
      </div>
    </section>
  );
};
