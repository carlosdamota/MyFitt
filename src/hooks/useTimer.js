import { useState, useEffect } from 'react';

export const useTimer = (initialTime = 60) => {
  const [timer, setTimer] = useState(initialTime);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  const resetTimer = (seconds) => { 
    setIsTimerRunning(false); 
    setTimer(seconds); 
    setIsTimerRunning(true); 
  };

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);

  return { timer, isTimerRunning, resetTimer, toggleTimer, setTimer };
};
