'use client';

import { useEffect, useState } from 'react';
import { Map, CustomOverlayMap } from 'react-kakao-maps-sdk';
import { CustomPieMarker } from '@/components/map/CustomPieMarker';
import { InstitutionPopover } from '@/components/map/InstitutionPopover';
import { HistoryDialog } from '@/components/map/HistoryDialog';

interface Institution {
  id: string;
  institutionCode: string;
  name: string;
  serviceType: string;
  capacity: number;
  currentHeadcount: number;
  address: string;
  latitude: number;
  longitude: number;
}

export default function MapViewPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchInstitutions() {
      try {
        const response = await fetch('/api/institutions');
        if (!response.ok) {
          throw new Error('데이터를 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        setInstitutions(data);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch institutions:', error);
        setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchInstitutions();
  }, []);

  const handleViewHistory = (institution: Institution) => {
    setSelectedInstitution({
      id: institution.id,
      name: institution.name,
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="relative h-full bg-slate-50">
        {/* 헤더 스켈레톤 */}
        <div className="absolute top-0 left-0 right-0 bg-white border-b p-4 shadow-sm">
          <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-slate-200 rounded animate-pulse" />
        </div>

        {/* 지도 로딩 메시지 */}
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4" />
            <p className="text-slate-600 font-medium">지도를 불러오는 중...</p>
            <p className="text-slate-500 text-sm mt-2">잠시만 기다려주세요</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative h-full bg-slate-50">
        {/* 헤더 */}
        <div className="absolute top-0 left-0 right-0 bg-white border-b p-4 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">지도 뷰</h1>
        </div>

        {/* 에러 메시지 */}
        <div className="flex h-full items-center justify-center">
          <div className="text-center max-w-md p-8">
            <div className="inline-block p-4 bg-red-50 rounded-full mb-4">
              <svg
                className="w-12 h-12 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              데이터 로드 실패
            </h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <Map
        center={{ lat: 36.5, lng: 127.5 }} // 대한민국 중심 좌표
        style={{ width: '100%', height: '100%' }}
        level={13} // 전국 뷰
      >
        {institutions.map((institution) => (
          <CustomOverlayMap
            key={institution.id}
            position={{ lat: institution.latitude, lng: institution.longitude }}
          >
            <InstitutionPopover
              institution={institution}
              onViewHistory={() => handleViewHistory(institution)}
            >
              <div>
                <CustomPieMarker
                  capacity={institution.capacity}
                  currentHeadcount={institution.currentHeadcount}
                />
              </div>
            </InstitutionPopover>
          </CustomOverlayMap>
        ))}
      </Map>

      {/* 상단 헤더 오버레이 */}
      <div className="absolute top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b p-4 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">지도 뷰</h1>
        <p className="text-sm text-slate-600 mt-1">
          전국 {institutions.length}개 장기요양기관 현황
        </p>
      </div>

      {/* 이력 다이얼로그 */}
      {selectedInstitution && (
        <HistoryDialog
          institutionId={selectedInstitution.id}
          institutionName={selectedInstitution.name}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </div>
  );
}
