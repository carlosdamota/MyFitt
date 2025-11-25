import React from 'react';
import { Dumbbell } from 'lucide-react';

// Importar imágenes generadas (simulado, en realidad usaremos rutas relativas a public o imports directos si están en src)
// Para este entorno, asumiremos que las imágenes se moverán a public/assets o se importarán.
// Dado que generate_image guarda en artifacts, primero debemos moverlas o referenciarlas correctamente.
// Por simplicidad en este entorno, usaremos las rutas absolutas de los artefactos para el prototipo, 
// pero en producción deberían estar en public.

// Mapeo de ejercicios a imágenes (URLs locales de los artefactos generados)
const exerciseImages = {
  floor_press: "/assets/images/floor_press.png",
  pushup_feet_elevated: "/assets/images/pushup_feet_elevated.png",
  shoulder_press: "/assets/images/shoulder_press.png",
  dips: "/assets/images/dips.png",
  pullup: "/assets/images/pullup.png",
  one_arm_row: "/assets/images/one_arm_row.png",
  bent_over_row: "/assets/images/bent_over_row.png",
  hammer_curl: "/assets/images/hammer_curl.png",
  bulgarian_split: "/assets/images/bulgarian_split.png",
  rdl: "/assets/images/rdl.png",
  side_squat: "/assets/images/side_squat.png",
};

const ExerciseIcon = ({ type, className = "w-full h-full object-contain" }) => {
  // Si tenemos una imagen generada para este tipo, la usamos
  if (exerciseImages[type]) {
    return (
      <img 
        src={exerciseImages[type]} 
        alt={type} 
        className={`${className} opacity-80 hover:opacity-100 transition-opacity duration-500`} 
      />
    );
  }

  // Fallback a los SVGs originales si no hay imagen
  switch (type) {
    case 'pullup':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M30 20 H70" strokeLinecap="round" />
          <path d="M50 20 V40" />
          <circle cx="50" cy="45" r="5" />
          <path d="M50 50 L30 70 M50 50 L70 70" />
          <path d="M50 50 L50 80 L40 100 M50 80 L60 100" />
        </svg>
      );
    case 'one_arm_row':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 80 L40 80 L40 60" />
          <circle cx="55" cy="30" r="5" />
          <path d="M55 35 L50 60 L45 80 M50 60 L65 50" />
          <path d="M65 50 L65 70" strokeDasharray="4 4" />
        </svg>
      );
    // ... (mantener el resto de los casos SVG como fallback)
    default:
      return (
        <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-600">
          <Dumbbell size={48} />
        </div>
      );
  }
};

export default ExerciseIcon;
