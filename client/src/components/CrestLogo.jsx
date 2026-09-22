import React from 'react';

export default function CrestLogo({ className = "w-8 h-8", inverted = false }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* Background shield / crest */}
        <rect
          x="3"
          y="3"
          width="42"
          height="42"
          rx="10"
          className={inverted ? "fill-white" : "fill-[#161514]"}
        />
        <rect
          x="4.5"
          y="4.5"
          width="39"
          height="39"
          rx="8.5"
          stroke={inverted ? "#161514" : "#9e7938"}
          strokeWidth="1"
          strokeOpacity="0.35"
        />

        {/* Master Tailor Monogram Z & Shears */}
        <path
          d="M15 15H33L19 33H33"
          stroke={inverted ? "#161514" : "#fdfbf7"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Needle / Shears subtle accent point */}
        <circle
          cx="33"
          cy="15"
          r="1.75"
          fill="#9e7938"
        />
        <circle
          cx="15"
          cy="33"
          r="1.75"
          fill="#9e7938"
        />
        <line
          x1="21"
          y1="24"
          x2="27"
          y2="24"
          stroke="#9e7938"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
