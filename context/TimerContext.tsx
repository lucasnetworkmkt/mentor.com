import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { TimerState } from '../types';
import { addPoints, checkTimerAchievement, TASK_REWARD } from '../services/gamificationService';

interface TimerContextType {
  timeLeft: number;
  initialTime: number;
  state: TimerState;
  task: string;
  setTask: (task: string) => void;
  startTimer: (duration?: number) => void;
  pauseTimer: () => void;
  resetTimer: (newDuration?: number) => void;
  resolveSession: (success: boolean) => void;
  sessionsCompleted: number;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

const STORAGE_KEY = 'MENTOR_EVOLUCAO_TIMER_STATE';

interface PersistedTimerState {
  endTime: number | null; // Timestamp when it ends
  remainingWhenPaused: number;
  initialTime: number;
  state: TimerState;
  task: string;
  sessionsCompleted: number;
}

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [state, setState] = useState<TimerState>(TimerState.IDLE);
  const [task, setTask] = useState('');
  const [endTime, setEndTime] = useState<number | null>(null);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // Audio Ref
  const audioContextRef = useRef<AudioContext | null>(null);

  // Load from Storage on Mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: PersistedTimerState = JSON.parse(saved);
        setInitialTime(parsed.initialTime);
        setTask(parsed.task || '');
        setSessionsCompleted(parsed.sessionsCompleted || 0);

        if (parsed.state === TimerState.RUNNING && parsed.endTime) {
          const now = Date.now();
          const delta = Math.ceil((parsed.endTime - now) / 1000);
          
          if (delta > 0) {
            setTimeLeft(delta);
            setEndTime(parsed.endTime);
            setState(TimerState.RUNNING);
          } else {
            setTimeLeft(0);
            setState(TimerState.COMPLETED);
          }
        } else if (parsed.state === TimerState.PAUSED) {
           setTimeLeft(parsed.remainingWhenPaused);
           setState(TimerState.PAUSED);
        } else {
           setState(TimerState.IDLE);
           setTimeLeft(parsed.initialTime);
        }
      } catch (e) {
        console.error("Timer load error", e);
      }
    }
  }, []);

  // Save to Storage whenever state changes
  useEffect(() => {
    const data: PersistedTimerState = {
      endTime,
      remainingWhenPaused: timeLeft,
      initialTime,
      state,
      task,
      sessionsCompleted
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [endTime, timeLeft, initialTime, state, task, sessionsCompleted]);

  // Tick Logic
  useEffect(() => {
    let interval: number;

    if (state === TimerState.RUNNING && endTime) {
      interval = window.setInterval(() => {
        const now = Date.now();
        const delta = Math.ceil((endTime - now) / 1000);

        if (delta <= 0) {
          handleCompletion();
          clearInterval(interval);
        } else {
          setTimeLeft(delta);
        }
      }, 200); // Check more frequently for smoothness
    }

    return () => clearInterval(interval);
  }, [state, endTime]);

  const playAlarm = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      if(ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'square';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5);

      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  const handleCompletion = () => {
    setTimeLeft(0);
    setState(TimerState.COMPLETED);
    setEndTime(null);
    playAlarm();
    // Note: We do NOT award points here anymore. User must confirm execution.
  };

  const startTimer = (duration?: number) => {
    if (!task.trim()) {
      alert("O Código exige clareza: Defina o entregável primeiro.");
      return;
    }
    
    // If resuming or starting fresh
    const timeToRun = duration || timeLeft;
    const end = Date.now() + (timeToRun * 1000);
    
    if (duration) {
        setInitialTime(duration);
        setTimeLeft(duration);
    }

    setEndTime(end);
    setState(TimerState.RUNNING);
  };

  const pauseTimer = () => {
    setState(TimerState.PAUSED);
    setEndTime(null);
  };

  const resetTimer = (newDuration?: number) => {
    setState(TimerState.IDLE);
    setEndTime(null);
    if (newDuration) {
        setInitialTime(newDuration);
        setTimeLeft(newDuration);
    } else {
        setTimeLeft(initialTime);
    }
  };

  const resolveSession = (success: boolean) => {
    if (success) {
      addPoints(TASK_REWARD);
      const newCount = sessionsCompleted + 1;
      setSessionsCompleted(newCount);
      checkTimerAchievement(newCount);
    }
    // Always reset to initial time after decision
    resetTimer(initialTime);
  };

  return (
    <TimerContext.Provider value={{
      timeLeft,
      initialTime,
      state,
      task,
      setTask,
      startTimer,
      pauseTimer,
      resetTimer,
      resolveSession,
      sessionsCompleted
    }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
