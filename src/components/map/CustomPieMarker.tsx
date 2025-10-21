'use client';

import { useState } from 'react';

interface CustomPieMarkerProps {
  capacity: number;
  currentHeadcount: number;
  onClick?: () => void;
}

export function CustomPieMarker({
  capacity,
  currentHeadcount,
  onClick,
}: CustomPieMarkerProps) {
  const [isHovered, setIsHovered] = useState(false);

  // 정원 대비 현원 비율 계산
  const occupancyRate = Math.min((currentHeadcount / capacity) * 100, 100);
  const isOvercapacity = currentHeadcount > capacity;

  // 파이 차트를 위한 SVG 경로 계산
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(occupancyRate / 100) * circumference} ${circumference}`;

  // 색상 결정
  const fillColor = isOvercapacity ? '#ef4444' : '#3b82f6'; // red-500 : blue-500
  const emptyColor = '#e2e8f0'; // slate-200

  return (
    <div
      className="relative cursor-pointer"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        transition: 'transform 0.2s ease-in-out',
      }}
    >
      {/* SVG Pie Chart */}
      <svg width="70" height="70" viewBox="0 0 70 70">
        {/* 배경 원 (빈 부분) */}
        <circle
          cx="35"
          cy="35"
          r={radius}
          fill="white"
          stroke={emptyColor}
          strokeWidth="8"
        />

        {/* 채워진 부분 (파이 차트) */}
        <circle
          cx="35"
          cy="35"
          r={radius}
          fill="none"
          stroke={fillColor}
          strokeWidth="8"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={circumference / 4} // 12시 방향에서 시작
          transform="rotate(-90 35 35)"
          style={{
            transition: 'stroke-dasharray 0.3s ease',
          }}
        />

        {/* 중앙 텍스트 */}
        <text
          x="35"
          y="32"
          textAnchor="middle"
          className="text-xs font-bold"
          fill={isOvercapacity ? '#ef4444' : '#1e293b'}
        >
          {currentHeadcount}
        </text>
        <text
          x="35"
          y="42"
          textAnchor="middle"
          className="text-[10px]"
          fill="#64748b"
        >
          / {capacity}
        </text>
      </svg>

      {/* 호버 시 그림자 효과 */}
      {isHovered && (
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: -1,
          }}
        />
      )}
    </div>
  );
}
