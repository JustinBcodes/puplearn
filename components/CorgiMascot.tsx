'use client';

interface CorgiMascotProps {
  size?: number;
  className?: string;
}

export default function CorgiMascot({ size = 80, className = '' }: CorgiMascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="50" cy="55" r="28" fill="#F4A460" />
      
      <ellipse cx="35" cy="40" rx="8" ry="12" fill="#F4A460" />
      <ellipse cx="65" cy="40" rx="8" ry="12" fill="#F4A460" />
      
      <ellipse cx="35" cy="42" rx="6" ry="10" fill="#FFDAB9" />
      <ellipse cx="65" cy="42" rx="6" ry="10" fill="#FFDAB9" />
      
      <circle cx="42" cy="52" r="4" fill="#2D1B00" />
      <circle cx="58" cy="52" r="4" fill="#2D1B00" />
      <circle cx="42" cy="51" r="1.5" fill="#FFFFFF" />
      <circle cx="58" cy="51" r="1.5" fill="#FFFFFF" />
      
      <ellipse cx="50" cy="60" rx="3" ry="4" fill="#2D1B00" />
      
      <path
        d="M 40 65 Q 50 70 60 65"
        stroke="#2D1B00"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      
      <ellipse cx="50" cy="75" rx="20" ry="8" fill="#FFFFFF" />
      
      <path
        d="M 30 48 Q 25 50 30 52"
        stroke="#2D1B00"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 70 48 Q 75 50 70 52"
        stroke="#2D1B00"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

