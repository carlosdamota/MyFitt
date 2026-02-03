import React from "react";
import { Dumbbell } from "lucide-react";

interface ExerciseIconProps {
  type?: string;
  className?: string;
}

const ExerciseIcon: React.FC<ExerciseIconProps> = ({
  type,
  className = "w-full h-full object-contain",
}) => {
  // Common style properties
  const strokeColor = "currentColor";
  const strokeWidth = "2.5";
  const floorOpacity = "0.2";

  switch (type) {
    case "pullup":
      return (
        <svg
          viewBox='0 0 100 100'
          className={className}
          fill='none'
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        >
          <path
            d='M10 20 H90'
            strokeLinecap='round'
            opacity={floorOpacity}
          />
          <path
            d='M25 20 V40 M75 20 V40'
            strokeLinecap='round'
          />
          <circle
            cx='50'
            cy='35'
            r='8'
          />
          <path
            d='M50 43 V65 M50 65 L35 85 M50 65 L65 85'
            strokeLinecap='round'
          />
          <path
            d='M25 40 L50 45 L75 40'
            strokeLinecap='round'
          />
        </svg>
      );
    case "floor_press":
      return (
        <svg
          viewBox='0 0 100 100'
          className={className}
          fill='none'
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        >
          <path
            d='M10 85 H90'
            strokeLinecap='round'
            opacity={floorOpacity}
          />
          <path
            d='M30 85 L40 70 L70 70'
            strokeLinecap='round'
          />
          <circle
            cx='75'
            cy='62'
            r='7'
          />
          <path
            d='M70 70 L85 55'
            strokeLinecap='round'
          />
          <rect
            x='80'
            y='45'
            width='12'
            height='6'
            rx='2'
            fill='currentColor'
          />
        </svg>
      );
    case "pushup_feet_elevated":
      return (
        <svg
          viewBox='0 0 100 100'
          className={className}
          fill='none'
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        >
          <rect
            x='15'
            y='65'
            width='20'
            height='20'
            rx='2'
            opacity={floorOpacity}
            fill='currentColor'
          />
          <path
            d='M35 65 L80 85'
            strokeWidth='5'
            strokeLinecap='round'
          />
          <circle
            cx='85'
            cy='75'
            r='7'
          />
          <path
            d='M80 85 L90 95'
            strokeLinecap='round'
          />
        </svg>
      );
    case "one_arm_row":
      return (
        <svg
          viewBox='0 0 100 100'
          className={className}
          fill='none'
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        >
          <path
            d='M20 75 H50 V55 H20 Z'
            opacity={floorOpacity}
            fill='currentColor'
          />
          <circle
            cx='60'
            cy='35'
            r='8'
          />
          <path
            d='M60 43 L55 65 L45 75'
            strokeLinecap='round'
          />
          <path
            d='M55 65 L75 60'
            strokeLinecap='round'
          />
          <rect
            x='75'
            y='55'
            width='8'
            height='15'
            rx='2'
            fill='currentColor'
          />
        </svg>
      );
    case "plank":
      return (
        <svg
          viewBox='0 0 100 100'
          className={className}
          fill='none'
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        >
          <path
            d='M10 85 H90'
            strokeLinecap='round'
            opacity={floorOpacity}
          />
          <path
            d='M30 80 L75 80'
            strokeWidth='8'
            strokeLinecap='round'
          />
          <circle
            cx='85'
            cy='72'
            r='7'
          />
          <path
            d='M25 80 L20 65'
            strokeLinecap='round'
          />
        </svg>
      );
    case "deadbug":
      return (
        <svg
          viewBox='0 0 100 100'
          className={className}
          fill='none'
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        >
          <path
            d='M20 80 H80'
            opacity={floorOpacity}
            strokeLinecap='round'
          />
          <path
            d='M30 75 L70 75'
            strokeWidth='6'
            strokeLinecap='round'
          />
          <circle
            cx='50'
            cy='65'
            r='7'
          />
          <path
            d='M40 75 L30 50 M60 75 L70 50'
            strokeLinecap='round'
          />
          <path
            d='M45 65 L35 85 M55 65 L65 40'
            strokeLinecap='round'
          />
        </svg>
      );
    case "glute_bridge":
      return (
        <svg
          viewBox='0 0 100 100'
          className={className}
          fill='none'
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        >
          <path
            d='M10 85 H90'
            opacity={floorOpacity}
            strokeLinecap='round'
          />
          <path
            d='M30 85 L50 60 L80 85'
            strokeWidth='5'
            strokeLinecap='round'
          />
          <circle
            cx='85'
            cy='75'
            r='7'
          />
        </svg>
      );
    case "side_squat":
      return (
        <svg
          viewBox='0 0 100 100'
          className={className}
          fill='none'
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        >
          <circle
            cx='50'
            cy='25'
            r='8'
          />
          <path
            d='M50 33 V55 L20 85 M50 55 L80 65'
            strokeLinecap='round'
            strokeWidth='4'
          />
          <path
            d='M35 45 L65 45'
            strokeLinecap='round'
          />
        </svg>
      );
    case "goblet_squat":
      return (
        <svg
          viewBox='0 0 100 100'
          className={className}
          fill='none'
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        >
          <circle
            cx='50'
            cy='25'
            r='8'
          />
          <path
            d='M50 33 L50 60 M30 85 L50 70 L70 85'
            strokeLinecap='round'
            strokeWidth='6'
          />
          <circle
            cx='50'
            cy='50'
            r='7'
            fill='currentColor'
          />
          <path
            d='M10 90 H90'
            opacity={floorOpacity}
            strokeLinecap='round'
          />
        </svg>
      );
    case "rdl_bilateral":
    case "rdl":
      return (
        <svg
          viewBox='0 0 100 100'
          className={className}
          fill='none'
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        >
          <path
            d='M30 35 L50 55 L70 35'
            strokeLinecap='round'
            strokeWidth='4'
          />
          <path
            d='M50 55 V85 M35 95 L50 85 L65 95'
            strokeLinecap='round'
          />
          <path
            d='M25 40 H75'
            strokeWidth='2'
            opacity='0.5'
          />
          <circle
            cx='20'
            cy='40'
            r='4'
            fill='currentColor'
          />
          <circle
            cx='80'
            cy='40'
            r='4'
            fill='currentColor'
          />
          <path
            d='M10 98 H90'
            opacity={floorOpacity}
            strokeLinecap='round'
          />
        </svg>
      );
    case "calf_raise_bilateral":
    case "seated_calf_raise":
      return (
        <svg
          viewBox='0 0 100 100'
          className={className}
          fill='none'
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        >
          <path
            d='M50 20 V65'
            strokeLinecap='round'
          />
          <path
            d='M40 90 L50 75 L60 90'
            strokeLinecap='round'
            strokeWidth='4'
          />
          <path
            d='M20 95 H80'
            opacity={floorOpacity}
            strokeLinecap='round'
          />
        </svg>
      );
    case "face_pull":
    case "rear_delt_fly":
      return (
        <svg
          viewBox='0 0 100 100'
          className={className}
          fill='none'
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        >
          <circle
            cx='50'
            cy='30'
            r='8'
          />
          <path
            d='M20 45 L50 55 L80 45'
            strokeWidth='5'
            strokeLinecap='round'
          />
          <path
            d='M50 38 V65'
            opacity='0.5'
          />
        </svg>
      );
    case "bicep_curl":
    case "hammer_curl":
      return (
        <svg
          viewBox='0 0 100 100'
          className={className}
          fill='none'
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        >
          <circle
            cx='45'
            cy='25'
            r='8'
          />
          <path
            d='M45 33 V65 L35 90 M45 65 L55 90'
            strokeLinecap='round'
          />
          <path
            d='M45 45 L70 35'
            strokeLinecap='round'
            strokeWidth='4'
          />
          <circle
            cx='75'
            cy='30'
            r='6'
            fill='currentColor'
          />
        </svg>
      );
    case "tricep_extension":
      return (
        <svg
          viewBox='0 0 100 100'
          className={className}
          fill='none'
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        >
          <circle
            cx='50'
            cy='30'
            r='8'
          />
          <path d='M50 38 V70' />
          <path
            d='M50 38 L70 15 L85 30'
            strokeLinecap='round'
            strokeWidth='4'
          />
          <circle
            cx='88'
            cy='33'
            r='5'
            fill='currentColor'
          />
        </svg>
      );
    case "shoulder_press":
    case "lateral_raise":
      return (
        <svg
          viewBox='0 0 100 100'
          className={className}
          fill='none'
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        >
          <circle
            cx='50'
            cy='25'
            r='8'
          />
          <path
            d='M20 45 L50 50 L80 45'
            strokeWidth='5'
            strokeLinecap='round'
          />
          <path
            d='M50 33 V65'
            opacity='0.5'
          />
          <circle
            cx='15'
            cy='40'
            r='5'
            fill='currentColor'
          />
          <circle
            cx='85'
            cy='40'
            r='5'
            fill='currentColor'
          />
        </svg>
      );
    case "leg_raise":
      return (
        <svg
          viewBox='0 0 100 100'
          className={className}
          fill='none'
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        >
          <path
            d='M20 85 H80'
            opacity={floorOpacity}
            strokeLinecap='round'
          />
          <path
            d='M30 80 L60 80'
            strokeWidth='6'
            strokeLinecap='round'
          />
          <path
            d='M60 80 L75 40'
            strokeWidth='5'
            strokeLinecap='round'
          />
          <circle
            cx='25'
            cy='72'
            r='7'
          />
        </svg>
      );
    default:
      return (
        <div className='w-full h-full flex items-center justify-center bg-slate-800 text-slate-600 rounded-lg'>
          <Dumbbell size={48} />
        </div>
      );
  }
};

export default ExerciseIcon;
