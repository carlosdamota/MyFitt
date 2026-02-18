import React from "react";
import { Shield, ArrowLeft, Mail } from "lucide-react";

const Privacy = () => {
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
          <div className='p-3 bg-blue-600/20 rounded-xl'>
            <Shield
              size={32}
              className='text-blue-400'
            />
          </div>
          <h1 className='text-3xl md:text-4xl font-bold text-white'>Política de Privacidad</h1>
        </div>

        <div className='space-y-8 text-slate-300 leading-relaxed'>
          <section>
            <h2 className='text-xl font-bold text-white mb-4'>1. Responsable del Tratamiento</h2>
            <p>
              El responsable del tratamiento de sus datos personales es:
              <br />
              <strong>Identidad:</strong> Carlos Damota Gracia
              <br />
              <strong>Domicilio:</strong> España
              <br />
              <strong>Email:</strong> daymondoomdev@duck.com
            </p>
          </section>

          <section>
            <h2 className='text-xl font-bold text-white mb-4'>2. Introducción</h2>
            <p>
              En FITTWIZ, la privacidad es una prioridad. Esta política describe cómo se recopila,
              usa y protege tu información personal cuando utilizas la aplicación, en cumplimiento
              con el Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica 3/2018
              (LOPDGDD).
            </p>
          </section>

          <section>
            <h2 className='text-xl font-bold text-white mb-4'>3. Información que Recopilamos</h2>
            <ul className='list-disc pl-5 space-y-2'>
              <li>
                <strong>Información de Cuenta:</strong> Tu dirección de correo electrónico y ID de
                usuario proporcionados a través de la autenticación de Google (Firebase Auth).
              </li>
              <li>
                <strong>Datos de Entrenamiento:</strong> Rutinas, registros de ejercicios, pesos,
                repeticiones y notas que introduces en la app.
              </li>
              <li>
                <strong>Datos de Perfil:</strong> Información física (peso, altura, edad) y
                preferencias de entrenamiento que configuras para personalizar tu experiencia.
              </li>
              <li>
                <strong>Datos de Uso:</strong> Información anónima sobre cómo interactúas con la
                aplicación (páginas visitadas, funciones utilizadas) a través de Google Analytics,
                solo si has dado tu consentimiento.
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-xl font-bold text-white mb-4'>4. Base Legal y Finalidad</h2>
            <p>Tratamos sus datos basándonos en:</p>
            <ul className='list-disc pl-5 space-y-2 mt-2'>
              <li>
                <strong>Ejecución del contrato:</strong> Para gestionar su cuenta, proporcionarle
                los servicios de la app y procesar sus pagos.
              </li>
              <li>
                <strong>Consentimiento:</strong> Para el uso de cookies analíticas y envío de
                comunicaciones comerciales (si procede).
              </li>
              <li>
                <strong>Interés Legítimo:</strong> Para mejorar nuestros servicios y garantizar la
                seguridad de la app.
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-xl font-bold text-white mb-4'>5. Almacenamiento y Conservación</h2>
            <p>
              Tus datos se almacenan de forma segura en los servidores de{" "}
              <strong>Google Cloud Platform (Firebase)</strong> en regiones habilitadas.
            </p>
            <p className='mt-2'>
              <strong>Conservación:</strong> Mantendremos sus datos mientras dure la relación
              contractual (su cuenta esté activa). Tras la baja, se bloquearán durante el plazo
              necesario para cumplir con obligaciones legales (fiscales, etc.) y posteriormente se
              eliminarán definitivamente.
            </p>
          </section>

          <section>
            <h2 className='text-xl font-bold text-white mb-4'>6. Destinatarios de los Datos</h2>
            <p>
              Para prestar nuestros servicios, compartimos datos estrictamente necesarios con los
              siguientes proveedores (Encargados del Tratamiento):
            </p>
            <ul className='list-disc pl-5 space-y-2 mt-2'>
              <li>
                <strong>Google Ireland Ltd. (Firebase):</strong> Infraestructura, autenticación y
                base de datos.
              </li>
              <li>
                <strong>Stripe, Inc.:</strong> Procesamiento de pagos y suscripciones.
              </li>
              <li>
                <strong>Google LLC (Gemini API):</strong> Generación de contenido IA (datos
                anonimizados).
              </li>
            </ul>
            <p className='mt-2'>No se cederán datos a otros terceros salvo obligación legal.</p>
          </section>

          <section>
            <h2 className='text-xl font-bold text-white mb-4'>7. Tus Derechos</h2>
            <p>Como usuario, tiene derecho a:</p>
            <ul className='list-disc pl-5 space-y-2 mt-2'>
              <li>Acceder, rectificar o suprimir sus datos.</li>
              <li>Limitar el tratamiento u oponerse al mismo.</li>
              <li>Portabilidad de sus datos.</li>
              <li>Retirar el consentimiento prestado en cualquier momento.</li>
            </ul>
            <p className='mt-3'>
              Puede ejercer estos derechos escribiendo a daymondoomdev@duck.com. Si considera que no
              hemos tratado sus datos correctamente, tiene derecho a presentar una reclamación ante
              la <strong>Agencia Española de Protección de Datos (AEPD)</strong>.
            </p>
          </section>

          <section>
            <h2 className='text-xl font-bold text-white mb-4'>8. Contacto</h2>
            <p className='mb-4'>
              Si tienes preguntas sobre esta política o quieres ejercer tus derechos, contáctanos
              en:
            </p>
            <a
              href='mailto:daymondoomdev@duck.com'
              className='inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors'
            >
              <Mail size={20} /> daymondoomdev@duck.com
            </a>
          </section>

          <div className='pt-8 border-t border-slate-800 text-sm text-slate-500'>
            Última actualización: Febrero 2026
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
