import React from "react";
import { Dumbbell } from "lucide-react";

interface ExerciseIconProps {
  type?: string;
  className?: string;
}

export const EXERCISE_ICON_KEYS = [
  "pullup",
  "floor_press",
  "pushup_feet_elevated",
  "one_arm_row",
  "plank",
  "deadbug",
  "glute_bridge",
  "side_squat",
  "goblet_squat",
  "rdl_bilateral",
  "rdl",
  "calf_raise_bilateral",
  "seated_calf_raise",
  "face_pull",
  "rear_delt_fly",
  "bicep_curl",
  "hammer_curl",
  "tricep_extension",
  "shoulder_press",
  "lateral_raise",
  "leg_raise",
];

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
          {/* Floor / Bar */}
          <path
            d='M10 20 H90'
            strokeLinecap='round'
            opacity={floorOpacity}
          />
          <path
            d='M25 20 V40 M75 20 V40'
            strokeLinecap='round'
          />
          {/* Head */}
          <circle
            cx='50'
            cy='35'
            r='6'
          />
          {/* Torso */}
          <path
            d='M50 41 V65'
            strokeLinecap='round'
            strokeWidth='4'
          />
          {/* Shoulders */}
          <path
            d='M35 45 H65'
            strokeLinecap='round'
            strokeWidth='3'
          />
          {/* Arms (bent at elbows) */}
          <path
            d='M35 45 L30 30 L25 40'
            strokeLinecap='round'
            strokeWidth='3'
          />
          <path
            d='M65 45 L70 30 L75 40'
            strokeLinecap='round'
            strokeWidth='3'
          />
          {/* Hips */}
          <path
            d='M40 65 H60'
            strokeLinecap='round'
            strokeWidth='3'
          />
          {/* Legs */}
          <path
            d='M42 65 L45 80 L50 90'
            strokeLinecap='round'
            strokeWidth='3'
          />
          <path
            d='M58 65 L55 80 L50 90'
            strokeLinecap='round'
            strokeWidth='3'
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
          {/* Floor */}
          <path
            d='M10 85 H90'
            strokeLinecap='round'
            opacity={floorOpacity}
          />
          {/* Bench/Body lying */}
          <path
            d='M30 85 L70 85'
            strokeWidth='4'
            strokeLinecap='round'
          />
          {/* Legs bent */}
          <path
            d='M30 85 L20 70 L30 85'
            strokeLinecap='round'
            strokeWidth='3'
          />{" "}
          {/* Left leg hidden/abstract */}
          <path
            d='M30 85 L25 70 L35 85'
            strokeLinecap='round'
            strokeWidth='3'
          />
          {/* Head */}
          <circle
            cx='75'
            cy='82'
            r='5'
          />
          {/* Arms pushing up */}
          <path
            d='M65 82 L70 65'
            strokeLinecap='round'
            strokeWidth='3'
          />
          {/* Barbell */}
          <path
            d='M60 65 L80 65'
            strokeLinecap='round'
            strokeWidth='4'
          />
          <rect
            x='58'
            y='62'
            width='4'
            height='6'
            rx='1'
            fill='currentColor'
          />
          <rect
            x='78'
            y='62'
            width='4'
            height='6'
            rx='1'
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
          {/* Bench/Box */}
          <rect
            x='10'
            y='65'
            width='20'
            height='20'
            rx='2'
            opacity={floorOpacity}
            fill='currentColor'
          />
          {/* Head */}
          <circle
            cx='85'
            cy='72'
            r='5'
          />
          {/* Torso */}
          <path
            d='M80 75 L55 65'
            strokeLinecap='round'
            strokeWidth='4'
          />
          {/* Legs (Elevated) */}
          <path
            d='M55 65 L40 60 L20 65'
            strokeLinecap='round'
            strokeWidth='3'
          />
          {/* Arms (Pushing) */}
          <path
            d='M75 73 L75 85 L80 95'
            strokeLinecap='round'
            strokeWidth='3'
          />
          <path
            d='M80 73 L85 85 L90 95'
            strokeLinecap='round'
            strokeWidth='3'
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
          {/* Bench */}
          <path
            d='M20 75 H50 V55 H20 Z'
            opacity={floorOpacity}
            fill='currentColor'
          />
          {/* Torso (Bent over) */}
          <path
            d='M70 45 L50 45'
            strokeLinecap='round'
            strokeWidth='4'
          />
          {/* Head */}
          <circle
            cx='75'
            cy='45'
            r='5'
          />
          {/* Legs (Stance) */}
          <path
            d='M50 45 L45 60 L45 75'
            strokeLinecap='round'
            strokeWidth='3'
          />{" "}
          {/* Knee on bench */}
          <path
            d='M50 45 L60 60 L60 90'
            strokeLinecap='round'
            strokeWidth='3'
          />{" "}
          {/* Standing leg */}
          {/* Arm (Rowing) */}
          <path
            d='M65 48 L60 65 L60 70'
            strokeLinecap='round'
            strokeWidth='3'
          />
          {/* Dumbbell */}
          <rect
            x='55'
            y='70'
            width='10'
            height='6'
            rx='2'
            fill='currentColor'
          />
          <line
            x1='60'
            y1='70'
            x2='60'
            y2='80'
            stroke='currentColor'
            strokeWidth='2'
          />
          <rect
            x='55'
            y='80'
            width='10'
            height='6'
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
          {/* Floor */}
          <path
            d='M10 85 H90'
            strokeLinecap='round'
            opacity={floorOpacity}
          />
          {/* Head */}
          <circle
            cx='85'
            cy='68'
            r='5'
          />
          {/* Body (Straight line) */}
          <path
            d='M80 70 L30 75'
            strokeWidth='4'
            strokeLinecap='round'
          />
          {/* Arms (Support) */}
          <path
            d='M80 70 L80 85 L90 85'
            strokeLinecap='round'
            strokeWidth='3'
          />
          {/* Legs */}
          <path
            d='M30 75 L25 85'
            strokeLinecap='round'
            strokeWidth='3'
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
          {/* Floor */}
          <path
            d='M20 80 H80'
            opacity={floorOpacity}
            strokeLinecap='round'
          />
          {/* Head */}
          <circle
            cx='50'
            cy='75'
            r='5'
          />
          {/* Torso (Lying) */}
          <path
            d='M45 78 L55 78'
            strokeWidth='6'
            strokeLinecap='round'
          />
          {/* Arms (Reaching up/back) */}
          <path
            d='M53 78 L55 60 L60 50'
            strokeLinecap='round'
            strokeWidth='3'
          />{" "}
          {/* Right arm */}
          <path
            d='M53 78 L45 60 L35 50'
            strokeLinecap='round'
            strokeWidth='3'
          />{" "}
          {/* Left arm */}
          {/* Legs (Table top / Extended) */}
          <path
            d='M47 78 L45 60 L55 50'
            strokeLinecap='round'
            strokeWidth='3'
          />{" "}
          {/* Right leg */}
          <path
            d='M47 78 L45 60 L35 60'
            strokeLinecap='round'
            strokeWidth='3'
          />{" "}
          {/* Left leg */}
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
          {/* Floor */}
          <path
            d='M10 85 H90'
            opacity={floorOpacity}
            strokeLinecap='round'
          />
          {/* Head */}
          <circle
            cx='85'
            cy='80'
            r='5'
          />
          {/* Shoulders */}
          <path
            d='M80 82 L70 85'
            strokeLinecap='round'
            strokeWidth='4'
          />
          {/* Torso/Hips (Bridged) */}
          <path
            d='M70 85 L50 65'
            strokeWidth='4'
            strokeLinecap='round'
          />
          {/* Legs */}
          <path
            d='M50 65 L30 85'
            strokeWidth='3'
            strokeLinecap='round'
          />
          <path
            d='M30 85 L35 85'
            strokeWidth='3'
            strokeLinecap='round'
          />{" "}
          {/* Feet */}
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
          {/* Head */}
          <circle
            cx='50'
            cy='25'
            r='5'
          />
          {/* Torso */}
          <path
            d='M50 30 V55'
            strokeLinecap='round'
            strokeWidth='4'
          />
          {/* Legs (Side lunge) */}
          <path
            d='M50 55 L30 70 L25 90'
            strokeLinecap='round'
            strokeWidth='3'
          />{" "}
          {/* Bent leg */}
          <path
            d='M50 55 L70 65 L85 90'
            strokeLinecap='round'
            strokeWidth='3'
          />{" "}
          {/* Straight leg */}
          {/* Arms */}
          <path
            d='M50 35 L40 50'
            strokeLinecap='round'
            strokeWidth='3'
          />
          <path
            d='M50 35 L60 50'
            strokeLinecap='round'
            strokeWidth='3'
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
          {/* Head */}
          <circle
            cx='50'
            cy='25'
            r='6'
          />
          {/* Torso - slightly forward lean */}
          <path
            d='M50 31 L45 55'
            strokeLinecap='round'
            strokeWidth='4'
          />
          {/* Legs - Squat position */}
          <path
            d='M45 55 L25 65 L25 85'
            strokeLinecap='round'
            strokeWidth='3'
          />{" "}
          {/* Back leg */}
          <path
            d='M45 55 L65 65 L65 85'
            strokeLinecap='round'
            strokeWidth='3'
          />{" "}
          {/* Front leg */}
          {/* Arms holding weight */}
          <path
            d='M48 35 L55 45 L48 40'
            strokeLinecap='round'
            strokeWidth='3'
          />
          {/* Weight */}
          <rect
            x='45'
            y='38'
            width='8'
            height='10'
            rx='2'
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
          {/* Floor */}
          <path
            d='M10 98 H90'
            opacity={floorOpacity}
            strokeLinecap='round'
          />
          {/* Head */}
          <circle
            cx='80'
            cy='35'
            r='5'
          />
          {/* Torso (Hinging) */}
          <path
            d='M80 40 L50 60'
            strokeLinecap='round'
            strokeWidth='4'
          />
          {/* Legs (Slight knee bend) */}
          <path
            d='M50 60 L45 80 L35 95'
            strokeLinecap='round'
            strokeWidth='3'
          />
          <path
            d='M50 60 L55 80 L65 95'
            strokeLinecap='round'
            strokeWidth='3'
          />
          {/* Arms (Holding bar) */}
          <path
            d='M75 45 L60 70'
            strokeLinecap='round'
            strokeWidth='3'
          />
          {/* Barbell */}
          <path
            d='M50 70 L70 70'
            strokeLinecap='round'
            strokeWidth='4'
          />
          <circle
            cx='50'
            cy='70'
            r='4'
            fill='currentColor'
          />
          <circle
            cx='70'
            cy='70'
            r='4'
            fill='currentColor'
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
          {/* Floor */}
          <path
            d='M20 95 H80'
            opacity={floorOpacity}
            strokeLinecap='round'
          />
          {/* Head */}
          <circle
            cx='50'
            cy='20'
            r='5'
          />
          {/* Torso */}
          <path
            d='M50 25 V55'
            strokeLinecap='round'
            strokeWidth='4'
          />
          {/* Legs (On toes) */}
          <path
            d='M50 55 L45 75 L45 90'
            strokeLinecap='round'
            strokeWidth='3'
          />
          <path
            d='M50 55 L55 75 L55 90'
            strokeLinecap='round'
            strokeWidth='3'
          />
          {/* Arms (Hanging or support) */}
          <path
            d='M50 30 L40 50'
            strokeLinecap='round'
            strokeWidth='3'
          />
          <path
            d='M50 30 L60 50'
            strokeLinecap='round'
            strokeWidth='3'
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
          {/* Head */}
          <circle
            cx='50'
            cy='30'
            r='5'
          />
          {/* Torso */}
          <path
            d='M50 35 V65'
            strokeLinecap='round'
            strokeWidth='4'
          />
          {/* Shoulders - Arms pulling back */}
          <path
            d='M50 40 L25 40 L20 30'
            strokeLinecap='round'
            strokeWidth='3'
          />{" "}
          {/* Left arm */}
          <path
            d='M50 40 L75 40 L80 30'
            strokeLinecap='round'
            strokeWidth='3'
          />{" "}
          {/* Right arm */}
          {/* Cable/Rope indicator */}
          <path
            d='M20 30 L50 10 L80 30'
            strokeWidth='1'
            strokeDasharray='4 2'
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
          {/* Head */}
          <circle
            cx='50'
            cy='25'
            r='5'
          />
          {/* Torso */}
          <path
            d='M50 30 V60'
            strokeLinecap='round'
            strokeWidth='4'
          />
          {/* Legs */}
          <path
            d='M50 60 L40 90'
            strokeLinecap='round'
            strokeWidth='3'
          />
          <path
            d='M50 60 L60 90'
            strokeLinecap='round'
            strokeWidth='3'
          />
          {/* Arm (Curling) */}
          <path
            d='M50 35 L50 50 L70 35'
            strokeLinecap='round'
            strokeWidth='3'
          />
          {/* Dumbbell */}
          <circle
            cx='75'
            cy='30'
            r='5'
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
          {/* Head */}
          <circle
            cx='50'
            cy='30'
            r='5'
          />
          {/* Torso */}
          <path
            d='M50 35 V65'
            strokeLinecap='round'
            strokeWidth='4'
          />
          {/* Legs */}
          <path
            d='M50 65 L40 95'
            strokeLinecap='round'
            strokeWidth='3'
          />
          <path
            d='M50 65 L60 95'
            strokeLinecap='round'
            strokeWidth='3'
          />
          {/* Arm (Overhead extension) */}
          <path
            d='M50 40 L50 15 L70 25'
            strokeLinecap='round'
            strokeWidth='3'
          />
          {/* Dumbbell */}
          <circle
            cx='75'
            cy='30'
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
          {/* Head */}
          <circle
            cx='50'
            cy='30'
            r='5'
          />
          {/* Torso */}
          <path
            d='M50 35 V65'
            strokeLinecap='round'
            strokeWidth='4'
          />
          {/* Legs (Seated or Standing) */}
          <path
            d='M50 65 L40 90'
            strokeLinecap='round'
            strokeWidth='3'
          />
          <path
            d='M50 65 L60 90'
            strokeLinecap='round'
            strokeWidth='3'
          />
          {/* Arms (Pressing up) */}
          <path
            d='M50 40 L25 40 L25 25'
            strokeLinecap='round'
            strokeWidth='3'
          />
          <path
            d='M50 40 L75 40 L75 25'
            strokeLinecap='round'
            strokeWidth='3'
          />
          {/* Dumbbells */}
          <circle
            cx='25'
            cy='20'
            r='5'
            fill='currentColor'
          />
          <circle
            cx='75'
            cy='20'
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
          {/* Floor */}
          <path
            d='M20 85 H80'
            opacity={floorOpacity}
            strokeLinecap='round'
          />
          {/* Head */}
          <circle
            cx='30'
            cy='80'
            r='5'
          />
          {/* Torso (Lying flat) */}
          <path
            d='M35 82 L60 82'
            strokeLinecap='round'
            strokeWidth='4'
          />
          {/* Legs (Raised) */}
          <path
            d='M60 82 L75 40'
            strokeWidth='3'
            strokeLinecap='round'
          />
          <path
            d='M60 82 L80 45'
            strokeWidth='3'
            strokeLinecap='round'
          />
          {/* Arms (By side) */}
          <path
            d='M40 82 L50 82'
            strokeLinecap='round'
            strokeWidth='3'
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
