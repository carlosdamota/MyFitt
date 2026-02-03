import { useState, useEffect, useRef } from "react";

export interface UseTimerReturn {
  timer: number;
  isTimerRunning: boolean;
  resetTimer: (seconds?: number) => void;
  toggleTimer: () => void;
  setTimer: React.Dispatch<React.SetStateAction<number>>;
}

export const useTimer = (initialTime: number = 60): UseTimerReturn => {
  const [timer, setTimer] = useState<number>(initialTime);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isTimerRunning && timer > 0) {
      intervalRef.current = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0) {
      setIsTimerRunning(false);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTimerRunning, timer]);

  const resetTimer = (seconds?: number): void => {
    setIsTimerRunning(false);
    setTimer(seconds || initialTime);
    setIsTimerRunning(true);
  };

  const toggleTimer = (): void => setIsTimerRunning(!isTimerRunning);

  return { timer, isTimerRunning, resetTimer, toggleTimer, setTimer };
};
