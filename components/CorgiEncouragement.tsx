'use client';

import { useEffect, useState } from 'react';
import CorgiMascot from './CorgiMascot';
import { useTheme } from '@/contexts/ThemeContext';

interface CorgiEncouragementProps {
  show: boolean;
  onHide: () => void;
}

const lightModeEncouragements = [
  "Great job! 🎉",
  "You're doing amazing! 🌟",
  "Keep going! 💪",
  "Woof woof! You got this! 🐾",
  "Smart human! 🧠",
  "Study time, let's fetch knowledge! 🐶☀️",
  "Pawsome work! 🐕",
  "You're on a roll! 🔥",
];

const darkModeEncouragements = [
  "Late night grind, I've got your back! 🌙🐶",
  "Midnight learner! So dedicated! 🌟",
  "Night owl study session! 🦉🐕",
  "Woof! Even in the dark, you shine! ✨",
  "Burning the midnight oil! 🔥",
  "Late night = Bright future! 🌙💡",
  "You're unstoppable! 💪🌙",
  "Pawsome dedication! 🐾🌟",
];

export default function CorgiEncouragement({ show, onHide }: CorgiEncouragementProps) {
  const [message, setMessage] = useState('');
  const { theme } = useTheme();

  useEffect(() => {
    if (show) {
      const messages = theme === 'light' ? lightModeEncouragements : darkModeEncouragements;
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
      const timer = setTimeout(onHide, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onHide, theme]);

  if (!show) return null;

  return (
    <div className="fixed bottom-8 right-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border-4 border-primary-300 dark:border-primary-600 animate-bounce z-50">
      <div className="flex items-center gap-4">
        <CorgiMascot size={60} />
        <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
          {message}
        </p>
      </div>
    </div>
  );
}

