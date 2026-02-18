import { motion } from 'motion/react';

/* ---- Starfish ---- */
export function Starfish({
  className = '',
  color = '#E8845C',
  size = 40,
}: {
  className?: string;
  color?: string;
  size?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: Math.random() * 0.4 + 0.3 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 60 60"
        fill="none"
      >
        {/* 5-pointed rounded starfish */}
        <path
          d="M30,2 Q33,20 48,8 Q40,24 58,30 Q40,36 48,52 Q33,40 30,58 Q27,40 12,52 Q20,36 2,30 Q20,24 12,8 Q27,20 30,2 Z"
          fill={color}
          stroke="#C96A42"
          strokeWidth="1"
        />
        {/* Center bump */}
        <circle cx="30" cy="30" r="5" fill="#D4764E" />
        {/* Dots on arms */}
        <circle cx="30" cy="14" r="1.5" fill="#D4764E" />
        <circle cx="44" cy="22" r="1.5" fill="#D4764E" />
        <circle cx="40" cy="42" r="1.5" fill="#D4764E" />
        <circle cx="20" cy="42" r="1.5" fill="#D4764E" />
        <circle cx="16" cy="22" r="1.5" fill="#D4764E" />
      </svg>
    </motion.div>
  );
}

/* ---- Seashell (spiral) ---- */
export function Shell({
  className = '',
  color = '#F5E6D3',
  size = 32,
}: {
  className?: string;
  color?: string;
  size?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.random() * 0.5 + 0.4 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
      >
        {/* Scallop shell body */}
        <path
          d="M20,36 Q4,28 4,18 Q4,6 20,4 Q36,6 36,18 Q36,28 20,36 Z"
          fill={color}
          stroke="#D4C4A8"
          strokeWidth="1"
        />
        {/* Ridges */}
        <path d="M20,6 Q18,20 20,36" stroke="#D4C4A8" strokeWidth="0.8" fill="none" />
        <path d="M20,6 Q14,18 12,32" stroke="#D4C4A8" strokeWidth="0.8" fill="none" />
        <path d="M20,6 Q26,18 28,32" stroke="#D4C4A8" strokeWidth="0.8" fill="none" />
        <path d="M20,6 Q10,14 7,24" stroke="#D4C4A8" strokeWidth="0.8" fill="none" />
        <path d="M20,6 Q30,14 33,24" stroke="#D4C4A8" strokeWidth="0.8" fill="none" />
        {/* Hinge */}
        <ellipse cx="20" cy="6" rx="3" ry="2" fill="#E8D5BC" />
      </svg>
    </motion.div>
  );
}

/* ---- Conch Shell ---- */
export function ConchShell({
  className = '',
  size = 36,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.random() * 0.4 + 0.5 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        fill="none"
      >
        {/* Spiral conch shape */}
        <path
          d="M32,38 Q8,36 6,22 Q4,10 18,6 Q28,4 34,12 Q38,18 34,24 Q30,28 26,26 Q22,24 24,20 Q26,18 28,20"
          fill="none"
          stroke="#E8C8A0"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M32,38 Q8,36 6,22 Q4,10 18,6 Q28,4 34,12 Q38,18 34,24 Q30,28 26,26 Q22,24 24,20 Q26,18 28,20"
          fill="none"
          stroke="#F5E0C4"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Inner detail */}
        <circle cx="27" cy="20" r="1.5" fill="#D4B088" />
      </svg>
    </motion.div>
  );
}

/* ---- Pebble Cluster ---- */
export function PebbleCluster({
  className = '',
  size = 60,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: Math.random() * 0.3 + 0.5 }}
    >
      <svg
        width={size}
        height={size * 0.6}
        viewBox="0 0 80 48"
        fill="none"
      >
        {/* Big pebble */}
        <ellipse cx="30" cy="30" rx="18" ry="12" fill="#B8A896" transform="rotate(-8 30 30)" />
        <ellipse cx="30" cy="28" rx="16" ry="10" fill="#C4B8A8" transform="rotate(-8 30 28)" />
        {/* Medium pebble */}
        <ellipse cx="55" cy="34" rx="13" ry="9" fill="#A89888" transform="rotate(12 55 34)" />
        <ellipse cx="55" cy="32" rx="11" ry="7" fill="#B8A898" transform="rotate(12 55 32)" />
        {/* Small pebble */}
        <ellipse cx="16" cy="38" rx="8" ry="6" fill="#9C8E80" transform="rotate(-15 16 38)" />
        <ellipse cx="16" cy="37" rx="7" ry="5" fill="#ACA090" transform="rotate(-15 16 37)" />
        {/* Tiny pebble */}
        <ellipse cx="44" cy="22" rx="6" ry="4" fill="#B0A494" transform="rotate(20 44 22)" />
        <ellipse cx="44" cy="21" rx="5" ry="3" fill="#BEB4A4" transform="rotate(20 44 21)" />
      </svg>
    </motion.div>
  );
}

/* ---- Single Rock ---- */
export function Rock({
  className = '',
  color = '#A89888',
  size = 24,
}: {
  className?: string;
  color?: string;
  size?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: Math.random() * 0.3 + 0.6 }}
    >
      <svg
        width={size}
        height={size * 0.7}
        viewBox="0 0 30 20"
        fill="none"
      >
        <ellipse cx="15" cy="13" rx="13" ry="7" fill={color} />
        <ellipse cx="15" cy="11" rx="12" ry="6" fill="#C4B8A8" />
        {/* Highlight */}
        <ellipse cx="12" cy="9" rx="4" ry="2" fill="#D0C8BC" opacity="0.5" />
      </svg>
    </motion.div>
  );
}
