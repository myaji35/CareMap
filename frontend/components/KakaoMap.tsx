'use client';

import { Map, MapMarker, CustomOverlayMap } from 'react-kakao-maps-sdk';
import { useState, useEffect, useRef } from 'react';
import { Institution } from '@/types/institution';

interface KakaoMapProps {
  institutions: Institution[];
  onMarkerClick?: (id: number) => void;
}

// 파이차트 마커 생성 함수
function createPieChartMarker(occupancyRate: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = 30;
  canvas.height = 30;
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  const centerX = 15;
  const centerY = 15;
  const radius = 12;

  // 색상 결정
  let fillColor = '#10B981';  // 녹색 (여유)
  if (occupancyRate >= 90) {
    fillColor = '#EF4444';  // 빨간색 (포화)
  } else if (occupancyRate >= 70) {
    fillColor = '#F59E0B';  // 주황색 (보통)
  }

  // 배경 원 (정원)
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.fillStyle = '#E5E7EB';
  ctx.fill();

  // 파이 차트 (현원)
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(
    centerX,
    centerY,
    radius,
    -Math.PI / 2,
    -Math.PI / 2 + (2 * Math.PI * (occupancyRate / 100))
  );
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();

  // 테두리
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.stroke();

  return canvas.toDataURL();
}

// 기관 정보 카드 컴포넌트
function InstitutionInfoCard({ institution }: { institution: Institution }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 min-w-[250px] max-w-[300px] animate-fadeIn">
      <h3 className="font-bold text-lg mb-2 text-gray-800">{institution.name}</h3>
      <div className="text-sm text-gray-600 space-y-1">
        <p>
          <span className="font-medium">급여종류:</span> {institution.service_type}
        </p>
        <p>
          <span className="font-medium">정원/현원:</span>{' '}
          {institution.current_headcount} / {institution.capacity}
          <span className="ml-2 text-xs font-semibold">
            ({institution.occupancy_rate?.toFixed(1)}%)
          </span>
        </p>
        <p className="text-xs text-gray-500 pt-1">{institution.address}</p>
      </div>
    </div>
  );
}

export function KakaoMap({ institutions, onMarkerClick }: KakaoMapProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Kakao Maps SDK 로드 확인
    const checkKakaoMaps = setInterval(() => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          setMapLoaded(true);
          setIsLoading(false);
        });
        clearInterval(checkKakaoMaps);
      }
    }, 100);

    return () => clearInterval(checkKakaoMaps);
  }, []);

  if (isLoading || !mapLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">지도를 로딩중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      <Map
        center={{ lat: 37.4, lng: 127.1 }}  // 서울-경기 중심
        style={{ width: '100%', height: '100%' }}
        level={9}
      >
        {institutions.map((institution) => {
          const occupancyRate = institution.occupancy_rate || 0;
          const markerImage = createPieChartMarker(occupancyRate);

          return (
            <div key={institution.id}>
              <CustomOverlayMap
                position={{ lat: institution.latitude, lng: institution.longitude }}
              >
                <div
                  className="cursor-pointer hover:scale-110 transition-transform"
                  style={{ width: '30px', height: '30px' }}
                  onMouseEnter={() => setHoveredId(institution.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => onMarkerClick?.(institution.id)}
                >
                  <img src={markerImage} alt={institution.name} width={30} height={30} />
                </div>
              </CustomOverlayMap>

              {hoveredId === institution.id && (
                <CustomOverlayMap
                  position={{ lat: institution.latitude, lng: institution.longitude }}
                  yAnchor={1.5}
                >
                  <InstitutionInfoCard institution={institution} />
                </CustomOverlayMap>
              )}
            </div>
          );
        })}
      </Map>

      {/* 범례 */}
      <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow-lg p-4 z-10">
        <h3 className="font-semibold text-sm mb-2 text-gray-700">정원 대비 현원 비율</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-gray-600">여유 있음 (&lt; 70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span className="text-gray-600">보통 (70-90%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-gray-600">포화 (≥ 90%)</span>
          </div>
        </div>
      </div>

      {/* 기관 수 표시 */}
      <div className="absolute top-6 left-6 bg-white rounded-lg shadow-lg px-4 py-2 z-10">
        <p className="text-sm text-gray-600">
          총 <span className="font-bold text-blue-600">{institutions.length}</span>개 기관
        </p>
      </div>
    </div>
  );
}
