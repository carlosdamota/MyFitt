import React from "react";
import { FileText, ArrowLeft, AlertTriangle } from "lucide-react";

const Terms = () => {
  return (
    <div className='min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 font-sans'>
      <div className='max-w-3xl mx-auto'>
        <a
          href='/'
          className='inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 transition-colors'
        >
          <ArrowLeft size={20} /> Volver a la App
        </a>

        <div className='flex items-center gap-4 mb-8'>
          <div className='p-3 bg-purple-600/20 rounded-xl'>
            <FileText
              size={32}
              className='text-purple-400'
            />
          </div>
          <h1 className='text-3xl md:text-4xl font-bold text-white'>Términos de Uso</h1>
        </div>

        <div className='space-y-8 text-slate-300 leading-relaxed'>
          <div className='bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-xl flex gap-3 items-start'>
            <AlertTriangle
              className='text-yellow-500 shrink-0 mt-1'
              size={24}
            />
            <div>
              <h3 className='text-yellow-500 font-bold mb-1'>Descargo de Responsabilidad Médico</h3>
              <p className='text-sm text-yellow-200/80'>
                FITTWIZ no es un sustituto del consejo médico profesional. Consulta siempre con un
                médico antes de comenzar cualquier programa de ejercicios o nutrición. El uso de
                esta aplicación es bajo tu propio riesgo.
              </p>
            </div>
          </div>

          <section>
            <h2 className='text-xl font-bold text-white mb-4'>1. Aceptación de los Términos</h2>
            <p>
              Al acceder y utilizar FITTWIZ, aceptas estar sujeto a estos Términos de Uso. Si no
              estás de acuerdo con alguna parte de los términos, no podrás acceder al servicio.
            </p>
          </section>

          <section>
            <h2 className='text-xl font-bold text-white mb-4'>2. Uso del Servicio</h2>
            <p>
              FITTWIZ es una herramienta personal desarrollada de forma independiente para el
              seguimiento de entrenamientos. Te comprometes a usar el servicio solo para fines
              legales y de acuerdo con estos términos.
            </p>
            <ul className='list-disc pl-5 space-y-2 mt-2'>
              <li>No debes usar el servicio para ninguna actividad ilegal o no autorizada.</li>
              <li>No debes intentar interferir con el funcionamiento adecuado del servicio.</li>
              <li>Eres responsable de mantener la seguridad de tu cuenta y contraseña.</li>
            </ul>
          </section>

          <section>
            <h2 className='text-xl font-bold text-white mb-4'>3. Propiedad Intelectual</h2>
            <p>
              El servicio y su contenido original, características y funcionalidad son y seguirán
              siendo propiedad exclusiva del desarrollador de FITTWIZ y sus licenciantes.
            </p>
          </section>

          <section>
            <h2 className='text-xl font-bold text-white mb-4'>4. Cuentas de Usuario</h2>
            <p>
              Al crear una cuenta con nosotros, garantizas que la información que proporcionas es
              precisa, completa y actual. El desarrollador se reserva el derecho de terminar cuentas
              que violen estos términos.
            </p>
          </section>

          <section>
            <h2 className='text-xl font-bold text-white mb-4'>5. Limitación de Responsabilidad</h2>
            <p>
              En ningún caso el desarrollador de FITTWIZ será responsable por daños indirectos,
              incidentales, especiales, consecuentes o punitivos, incluyendo sin limitación, pérdida
              de beneficios, datos, uso, buena voluntad, u otras pérdidas intangibles, resultantes
              de tu acceso o uso o incapacidad de acceder o usar el servicio.
            </p>
          </section>

          <section>
            <h2 className='text-xl font-bold text-white mb-4'>6. Cambios</h2>
            <p>
              El desarrollador se reserva el derecho, a su sola discreción, de modificar o
              reemplazar estos Términos en cualquier momento. Intentaremos proporcionar un aviso de
              al menos 30 días antes de que cualquier término nuevo entre en vigor.
            </p>
          </section>

          <div className='pt-8 border-t border-slate-800 text-sm text-slate-500'>
            Última actualización: Febrero 2026
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
