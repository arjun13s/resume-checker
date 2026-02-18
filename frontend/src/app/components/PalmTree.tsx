import { motion } from 'motion/react';

interface PalmTreeProps {
  className?: string;
  animate?: boolean;
  delay?: number;
}

export function PalmTree({ className = '', animate = true, delay = 0 }: PalmTreeProps) {
  const animationProps = animate ? {
    animate: {
      rotate: [0, 3, 0, -3, 0],
    },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
      delay
    }
  } : {};

  return (
    <motion.div className={className} {...animationProps}>
      <svg className="w-full h-auto" viewBox="0 0 120 140" fill="none">
        {/* Trunk - soft rounded with horizontal bands */}
        <ellipse cx="60" cy="115" rx="12" ry="8" fill="#A0826D" />
        <path 
          d="M 48,115 Q 48,100 50,85 Q 51,70 52,55 Q 53,40 55,25 Q 56,20 60,18 Q 64,20 65,25 Q 67,40 68,55 Q 69,70 70,85 Q 72,100 72,115 Z" 
          fill="#C4A578"
        />
        
        {/* Horizontal trunk bands (soft) */}
        <ellipse cx="60" cy="100" rx="11" ry="5" fill="#A0826D" opacity="0.4" />
        <ellipse cx="60" cy="80" rx="10" ry="5" fill="#A0826D" opacity="0.4" />
        <ellipse cx="60" cy="60" rx="9" ry="4" fill="#A0826D" opacity="0.4" />
        <ellipse cx="60" cy="40" rx="8" ry="4" fill="#A0826D" opacity="0.4" />
        
        {/* Coconut cluster at top */}
        <ellipse cx="52" cy="22" rx="6" ry="7" fill="#8B6F47" />
        <ellipse cx="60" cy="20" rx="6" ry="7" fill="#A0826D" />
        <ellipse cx="68" cy="22" rx="6" ry="7" fill="#8B6F47" />
        
        {/* Palm leaves - soft rounded shapes, back layer */}
        {/* Left back leaf */}
        <ellipse 
          cx="25" 
          cy="35" 
          rx="28" 
          ry="12" 
          fill="#6B9E3E"
          transform="rotate(-35 25 35)"
        />
        
        {/* Right back leaf */}
        <ellipse 
          cx="95" 
          cy="35" 
          rx="28" 
          ry="12" 
          fill="#6B9E3E"
          transform="rotate(35 95 35)"
        />
        
        {/* Center back leaf */}
        <ellipse 
          cx="60" 
          cy="10" 
          rx="12" 
          ry="30" 
          fill="#7CB342"
        />
        
        {/* Palm leaves - front layer */}
        {/* Left front leaf */}
        <ellipse 
          cx="20" 
          cy="25" 
          rx="32" 
          ry="14" 
          fill="#8BC34A"
          transform="rotate(-25 20 25)"
        />
        
        {/* Right front leaf */}
        <ellipse 
          cx="100" 
          cy="25" 
          rx="32" 
          ry="14" 
          fill="#8BC34A"
          transform="rotate(25 100 25)"
        />
        
        {/* Center-left front leaf */}
        <ellipse 
          cx="35" 
          cy="18" 
          rx="30" 
          ry="13" 
          fill="#7CB342"
          transform="rotate(-15 35 18)"
        />
        
        {/* Center-right front leaf */}
        <ellipse 
          cx="85" 
          cy="18" 
          rx="30" 
          ry="13" 
          fill="#7CB342"
          transform="rotate(15 85 18)"
        />
        
        {/* Top center leaf */}
        <ellipse 
          cx="60" 
          cy="8" 
          rx="13" 
          ry="32" 
          fill="#8BC34A"
        />
      </svg>
    </motion.div>
  );
}