import React from "react";
import { Check, Lock } from "lucide-react";

export interface MedalIconProps extends React.SVGProps<SVGSVGElement> {
  type: "bronze" | "silver" | "gold";
  locked?: boolean;
  achieved?: boolean;
}

export function MedalIcon({
  type,
  locked = false,
  achieved = false,
  className = "",
  ...props
}: MedalIconProps) {
  const colors = {
    bronze: {
      grad1: "#d97706", // amber-600
      grad2: "#92400e", // amber-800
      glow: "rgba(217,119,6,0.5)",
    },
    silver: {
      grad1: "#94a3b8", // slate-400
      grad2: "#475569", // slate-600
      glow: "rgba(148,163,184,0.5)",
    },
    gold: {
      grad1: "#eab308", // yellow-500
      grad2: "#a16207", // yellow-700
      glow: "rgba(234,179,8,0.5)",
    },
  };

  const currentTheme = locked
    ? { grad1: "#e2e8f0", grad2: "#94a3b8", glow: "transparent" } // locked slate
    : colors[type];

  const id = `medal-grad-${type}-${locked ? "locked" : "unlocked"}`;

  // Si está bloqueado o en modo dark, el color locked debe adaptarse.
  // Usa "currentColor" pero para un SVG estructurado mejor dependemos de clases Tailwind

  const circleClass = locked
    ? "fill-slate-200 stroke-slate-300 dark:fill-surface-800 dark:stroke-surface-700"
    : "";

  const ribbonClass = locked ? "fill-slate-300 dark:fill-surface-700" : "";

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        viewBox='0 0 32 40'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='h-full w-full drop-shadow-md transition-transform duration-300 hover:scale-110'
        style={!locked ? { filter: `drop-shadow(0 0 4px ${currentTheme.glow})` } : {}}
        {...props}
      >
        {!locked && (
          <defs>
            <linearGradient
              id={id}
              x1='0'
              y1='0'
              x2='32'
              y2='32'
              gradientUnits='userSpaceOnUse'
            >
              <stop stopColor={currentTheme.grad1} />
              <stop
                offset='1'
                stopColor={currentTheme.grad2}
              />
            </linearGradient>

            <linearGradient
              id={`${id}-ribbon`}
              x1='0'
              y1='16'
              x2='32'
              y2='40'
              gradientUnits='userSpaceOnUse'
            >
              <stop stopColor={currentTheme.grad2} />
              <stop
                offset='1'
                stopColor='#000'
                stopOpacity={0.6}
              />
            </linearGradient>
          </defs>
        )}

        {/* Cintas base */}
        <path
          d='M5 16L0 34L8 30L14 36L14 16Z'
          fill={locked ? undefined : `url(#${id}-ribbon)`}
          className={ribbonClass}
        />
        <path
          d='M27 16L32 34L24 30L18 36L18 16Z'
          fill={locked ? undefined : `url(#${id}-ribbon)`}
          className={ribbonClass}
        />

        {/* Medalla borde (16-point star/badge shape) - vamos a usar dos círculos y un borde engrosado simple por ahora para que sea limpio */}
        {/* Un círculo central premium */}
        <circle
          cx='16'
          cy='14'
          r='12'
          fill={locked ? undefined : `url(#${id})`}
          className={circleClass}
          stroke={locked ? undefined : currentTheme.grad1}
          strokeWidth='1.5'
        />

        {/* Inner circle detail */}
        <circle
          cx='16'
          cy='14'
          r='9'
          fill='none'
          stroke={locked ? "currentColor" : "#ffffff"}
          strokeWidth='1'
          strokeDasharray='2 2'
          className='opacity-30 dark:opacity-20'
        />

        {/* Centro de la estrella si no está bloqueado */}
        {!locked && (
          <path
            d='M16 8L18.4697 12.1641L23.1231 13.0645L19.8974 16.4863L20.4705 21.1855L16 19.2L11.5295 21.1855L12.1026 16.4863L8.87689 13.0645L13.5303 12.1641L16 8Z'
            fill='#ffffff'
            opacity='0.8'
          />
        )}
      </svg>

      {locked && !achieved && (
        <div className='absolute inset-0 flex items-center justify-center pb-3'>
          <Lock
            className='h-4 w-4 text-slate-500 dark:text-surface-500'
            strokeWidth={3}
          />
        </div>
      )}

      {achieved && (
        <div className='absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-amber-500 shadow-sm dark:border-surface-900'>
          <Check
            strokeWidth={4}
            className='h-2.5 w-2.5 text-white'
          />
        </div>
      )}
    </div>
  );
}
