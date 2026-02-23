import React from "react";
import { FileText, ArrowLeft, AlertTriangle } from "lucide-react";

const Terms = () => {
  return (
    <div className='min-h-screen bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 p-6 md:p-12 font-sans transition-colors'>
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
          <h1 className='text-3xl md:text-4xl font-bold text-slate-900 dark:text-white transition-colors'>
            Términos de Uso
          </h1>
        </div>

        <div className='space-y-8 text-slate-600 dark:text-slate-300 leading-relaxed'>
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
            <h2 className='text-xl font-bold text-slate-900 dark:text-white mb-4 transition-colors'>
              1. Aceptación y Edad Mínima
            </h2>
            <p>
              Al acceder y utilizar FITTWIZ, aceptas estar sujeto a estos Términos de Uso. Debes
              tener al menos <strong>16 años</strong> para utilizar este servicio. Si eres menor,
              necesitas autorización de tus padres o tutores legales.
            </p>
          </section>

          <section>
            <h2 className='text-xl font-bold text-slate-900 dark:text-white mb-4 transition-colors'>
              2. Uso del Servicio
            </h2>
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
            <h2 className='text-xl font-bold text-slate-900 dark:text-white mb-4 transition-colors'>
              3. Propiedad Intelectual
            </h2>
            <p>
              El servicio y su contenido original, características y funcionalidad son y seguirán
              siendo propiedad exclusiva del desarrollador de FITTWIZ y sus licenciantes.
            </p>
          </section>

          <section>
            <h2 className='text-xl font-bold text-slate-900 dark:text-white mb-4 transition-colors'>
              4. Cuentas de Usuario
            </h2>
            <p>
              Al crear una cuenta con nosotros, garantizas que la información que proporcionas es
              que violen estos términos.
            </p>
          </section>

          <section>
            <h2 className='text-xl font-bold text-slate-900 dark:text-white mb-4 transition-colors'>
              5. Condiciones de Suscripción
            </h2>
            <p>FITTWIZ ofrece un plan gratuito y un plan Pro de pago.</p>
            <ul className='list-disc pl-5 space-y-2 mt-2'>
              <li>
                <strong>Pagos:</strong> Se procesan de forma segura a través de Stripe.
              </li>
              <li>
                <strong>Renovación:</strong> Las suscripciones se renuevan automáticamente salvo que
                las canceles antes del fin del periodo actual.
              </li>
              <li>
                <strong>Cancelación:</strong> Puedes cancelar tu suscripción en cualquier momento
                desde tu perfil. Mantendrás el acceso Pro hasta el final del ciclo de facturación
                pagado.
              </li>
              <li>
                <strong>Derecho de Desistimiento:</strong> De acuerdo con la normativa de consumo,
                tienes derecho a desistir de la compra en un plazo de 14 días naturales desde la
                suscripción inicial, siempre que no hayas hecho un uso sustancial del servicio
                digital. Para ejercerlo, contáctanos.
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-xl font-bold text-slate-900 dark:text-white mb-4 transition-colors'>
              6. Limitación de Responsabilidad
            </h2>
            <p>
              En ningún caso el desarrollador de FITTWIZ será responsable por daños indirectos,
              incidentales, especiales, consecuentes o punitivos, incluyendo sin limitación, pérdida
              de beneficios, datos, uso, buena voluntad, u otras pérdidas intangibles, resultantes
              de tu acceso o uso o incapacidad de acceder o usar el servicio.
            </p>
          </section>

          <section>
            <h2 className='text-xl font-bold text-slate-900 dark:text-white mb-4 transition-colors'>
              7. Ley Aplicable y Jurisdicción
            </h2>
            <p>
              Estos Términos se regirán e interpretarán de acuerdo con las leyes de{" "}
              <strong>España</strong>.
            </p>
            <p className='mt-2'>
              Para cualquier controversia, ambas partes se someten a los Juzgados y Tribunales del
              domicilio del usuario (si es consumidor) o de España (en otros casos).
            </p>
          </section>

          <section>
            <h2 className='text-xl font-bold text-slate-900 dark:text-white mb-4 transition-colors'>
              8. Cambios
            </h2>
            <p>
              El desarrollador se reserva el derecho de modificar estos Términos. Notificaremos los
              cambios sustanciales con al menos 30 días de antelación.
            </p>
          </section>

          <div className='pt-8 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500 transition-colors'>
            Última actualización: Febrero 2026
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
