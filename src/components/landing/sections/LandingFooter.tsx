import React from "react";

export const LandingFooter: React.FC = () => {
  return (
    <footer className='border-t border-slate-200 dark:border-slate-900 py-8 text-center text-slate-500 dark:text-slate-600 text-sm transition-colors'>
      <p>&copy; {new Date().getFullYear()} FITTWIZ. Todos los derechos reservados.</p>
      <div className='mt-2 flex justify-center gap-4'>
        <a
          href='/privacy'
          className='hover:text-slate-400 transition-colors'
        >
          Privacidad
        </a>
        <a
          href='/terms'
          className='hover:text-slate-400 transition-colors'
        >
          Términos
        </a>
      </div>
    </footer>
  );
};
