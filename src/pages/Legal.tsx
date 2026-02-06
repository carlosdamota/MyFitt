import React from "react";
import { Scale, ArrowLeft, Building } from "lucide-react";

const Legal = () => {
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
          <div className='p-3 bg-slate-800 rounded-xl'>
            <Scale
              size={32}
              className='text-slate-400'
            />
          </div>
          <h1 className='text-3xl md:text-4xl font-bold text-white'>Aviso Legal</h1>
        </div>

        <div className='space-y-8 text-slate-300 leading-relaxed'>
          <section>
            <h2 className='text-xl font-bold text-white mb-4 flex items-center gap-2'>
              <Building
                size={20}
                className='text-blue-400'
              />{" "}
              Titular del Sitio Web
            </h2>
            <div className='bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-3'>
              <p>
                <span className='text-slate-500 w-32 inline-block'>Nombre:</span> FitForge App
              </p>
              <p>
                <span className='text-slate-500 w-32 inline-block'>Contacto:</span>{" "}
                daymondoomdev@duck.com
              </p>
              <p>
                <span className='text-slate-500 w-32 inline-block'>Actividad:</span> Aplicación de
                fitness y salud
              </p>
            </div>
          </section>

          <section>
            <h2 className='text-xl font-bold text-white mb-4'>1. Objeto</h2>
            <p>
              El presente aviso legal regula el uso del sitio web y aplicación FitForge, que pone a
              disposición de los usuarios de Internet.
            </p>
          </section>

          <section>
            <h2 className='text-xl font-bold text-white mb-4'>
              2. Propiedad Intelectual e Industrial
            </h2>
            <p>
              Todos los derechos de propiedad industrial e intelectual de la totalidad de elementos
              contenidos en esta Web, incluidas las marcas comerciales, formatos, diseños gráficos,
              textos, imágenes y documentos, pertenecen a FitForge y se encuentran protegidos por
              las leyes españolas e internacionales sobre propiedad Intelectual e Industrial.
            </p>
          </section>

          <section>
            <h2 className='text-xl font-bold text-white mb-4'>3. Alojamiento de Datos</h2>
            <p>
              Esta aplicación está alojada en la infraestructura de Google Cloud Platform
              (Firebase), cumpliendo con los estándares de seguridad y privacidad requeridos.
            </p>
          </section>

          <section>
            <h2 className='text-xl font-bold text-white mb-4'>4. Ley Aplicable y Jurisdicción</h2>
            <p>
              Para la resolución de todas las controversias o cuestiones relacionadas con el
              presente sitio web o de las actividades en él desarrolladas, será de aplicación la
              legislación española, a la que se someten expresamente las partes.
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

export default Legal;
