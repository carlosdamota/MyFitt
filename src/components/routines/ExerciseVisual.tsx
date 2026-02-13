import React from "react";
import ExerciseIcon from "../icons/ExerciseIcons";
import { getExerciseIcon } from "../../utils/exerciseIcons";

interface ExerciseVisualProps {
  name: string;
  svg?: string;
  svgIcon?: string;
}

const ExerciseVisual: React.FC<ExerciseVisualProps> = ({ name, svg, svgIcon }) => {
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
