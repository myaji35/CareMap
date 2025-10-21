'use client';

interface ClusterMarkerProps {
  count: number;
  onClick?: () => void;
}

export function ClusterMarker({ count, onClick }: ClusterMarkerProps) {
  // 기관 수에 따라 마커 크기 조정
  const getSize = () => {
    if (count < 10) return { width: 40, height: 40, fontSize: '14px' };
    if (count < 100) return { width: 50, height: 50, fontSize: '16px' };
    if (count < 1000) return { width: 60, height: 60, fontSize: '18px' };
    return { width: 70, height: 70, fontSize: '20px' };
  };

  const size = getSize();

  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer transition-transform hover:scale-110"
      style={{
        width: size.width,
        height: size.height,
      }}
    >
      {/* 외곽 테두리 (그림자 효과) */}
      <div
        className="absolute inset-0 rounded-full bg-blue-600 opacity-20"
        style={{
          transform: 'scale(1.2)',
        }}
      />

      {/* 메인 원형 배경 */}
      <div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg flex items-center justify-center"
      >
        {/* 숫자 표시 */}
        <div className="text-white font-bold" style={{ fontSize: size.fontSize }}>
          {count}
        </div>
      </div>

      {/* 호버 시 펄스 효과 */}
      <div className="absolute inset-0 rounded-full bg-blue-400 opacity-0 hover:opacity-30 transition-opacity animate-ping" />
    </div>
  );
}
