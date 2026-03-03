import React, { useState } from "react";
import ExerciseIcon from "../icons/ExerciseIcons";
import { getExerciseIcon } from "../../utils/exerciseIcons";

interface ExerciseVisualProps {
  name: string;
  svg?: string;
  svgIcon?: string;
  imageUrl?: string;
}

const ExerciseVisual: React.FC<ExerciseVisualProps> = ({ name, svg, svgIcon, imageUrl }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (imageUrl && !hasError) {
    return (
      <div className='relative w-full h-full flex items-center justify-center'>
        {/* Loading skeleton while GIF downloads */}
        {!isLoaded && (
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='w-12 h-12 rounded-full border-2 border-slate-200 dark:border-white/10 border-t-primary-500 animate-spin' />
          </div>
        )}
        {/* White pill container — GIFs from ExerciseDB have white/near-white backgrounds,
            so we embrace it with a clean rounded container instead of fighting with blend modes */}
        <div
          className={`bg-white rounded-2xl p-1 shadow-sm dark:shadow-lg dark:shadow-black/20 transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={imageUrl}
            alt={`Ilustración de ${name}`}
            className='max-h-36 w-auto object-contain rounded-xl'
            loading='lazy'
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
          />
        </div>
      </div>
    );
  }

  if (svgIcon) {
    return (
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgIcon)}`}
        alt={`Ilustración de ${name}`}
        className='w-full h-full object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]'
        loading='lazy'
      />
    );
  }

  return <ExerciseIcon type={getExerciseIcon(name, svg)} />;
};

export default ExerciseVisual;
