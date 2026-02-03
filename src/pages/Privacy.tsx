import React from 'react';
import { Shield, ArrowLeft, Mail } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 transition-colors">
          <ArrowLeft size={20} /> Volver a la App
        </a>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-600/20 rounded-xl">
            <Shield size={32} className="text-blue-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Política de Privacidad</h1>
        </div>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. Introducción</h2>
            <p>
              En FitManual, nos tomamos muy en serio tu privacidad. Esta política describe cómo recopilamos, usamos y protegemos tu información personal cuando utilizas nuestra aplicación.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. Información que Recopilamos</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Información de Cuenta:</strong> Tu dirección de correo electrónico y ID de usuario proporcionados a través de la autenticación de Google (Firebase Auth).</li>
              <li><strong>Datos de Entrenamiento:</strong> Rutinas, registros de ejercicios, pesos, repeticiones y notas que introduces en la app.</li>
              <li><strong>Datos de Perfil:</strong> Información física (peso, altura, edad) y preferencias de entrenamiento que configuras para personalizar tu experiencia.</li>
              <li><strong>Datos de Uso:</strong> Información anónima sobre cómo interactúas con la aplicación (páginas visitadas, funciones utilizadas) a través de Google Analytics, solo si has dado tu consentimiento.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. Cómo Usamos tu Información</h2>
            <p>Utilizamos tus datos exclusivamente para:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Proporcionarte las funcionalidades de la aplicación (guardar tus rutinas, mostrar tu progreso).</li>
              <li>Generar rutinas personalizadas mediante Inteligencia Artificial (Gemini API).</li>
              <li>Mejorar la aplicación basándonos en patrones de uso anónimos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. Almacenamiento y Seguridad</h2>
            <p>
              Tus datos se almacenan de forma segura en Google Firebase (Firestore). Implementamos reglas de seguridad estrictas para asegurar que solo tú puedas acceder y modificar tus datos personales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. Compartir Datos</h2>
            <p>
              No vendemos ni compartimos tu información personal con terceros. Los datos enviados a la API de Gemini para generar rutinas son anónimos y no se utilizan para entrenar sus modelos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">6. Tus Derechos</h2>
            <p>Tienes derecho a:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Acceder a tus datos personales.</li>
              <li>Corregir cualquier dato inexacto.</li>
              <li>Solicitar la eliminación completa de tu cuenta y todos tus datos.</li>
              <li>Exportar tus datos en un formato legible.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">7. Contacto</h2>
            <p className="mb-4">
              Si tienes preguntas sobre esta política o quieres ejercer tus derechos, contáctanos en:
            </p>
            <a href="mailto:soporte@fitmanual.app" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
              <Mail size={20} /> soporte@fitmanual.app
            </a>
          </section>

          <div className="pt-8 border-t border-slate-800 text-sm text-slate-500">
            Última actualización: Diciembre 2025
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
