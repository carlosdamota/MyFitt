import React from "react";
import { Link } from "react-router";
import { Shield, FileText, Scale, Heart } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className='bg-slate-950 border-t border-slate-900 py-8 px-4 mt-12'>
      <div className='max-w-4xl mx-auto'>
        <div className='flex flex-col md:flex-row justify-between items-center gap-6'>
          {/* Brand & Copyright */}
          <div className='text-center md:text-left'>
            <h3 className='text-lg font-bold text-white mb-1'>FitForge</h3>
            <p className='text-xs text-slate-500'>
              &copy; {new Date().getFullYear()} FitForge. Todos los derechos reservados.
            </p>
          </div>

          {/* Links */}
          <div className='flex flex-wrap justify-center gap-6'>
            <Link
              to='/privacy'
              className='text-xs text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1.5'
            >
              <Shield size={14} /> Privacidad
            </Link>
            <Link
              to='/terms'
              className='text-xs text-slate-400 hover:text-purple-400 transition-colors flex items-center gap-1.5'
            >
              <FileText size={14} /> Términos
            </Link>
            <Link
              to='/legal'
              className='text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5'
            >
              <Scale size={14} /> Legal
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div className='mt-8 pt-6 border-t border-slate-900 text-center'>
          <p className='text-[10px] text-slate-600 max-w-2xl mx-auto leading-relaxed'>
            FitForge es una herramienta de seguimiento de fitness. No ofrecemos consejo médico.
            Consulta siempre a un profesional de la salud antes de comenzar cualquier programa de
            ejercicios. Desarrollado con{" "}
            <Heart
              size={10}
              className='inline text-red-500 mx-0.5'
            />{" "}
            y mucha cafeína.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
