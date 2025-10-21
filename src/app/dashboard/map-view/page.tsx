'use client';

import { useEffect, useState, useMemo } from 'react';
import { Map, CustomOverlayMap, MapMarker, useKakaoLoader } from 'react-kakao-maps-sdk';
import { CustomPieMarker } from '@/components/map/CustomPieMarker';
import { InstitutionPopover } from '@/components/map/InstitutionPopover';
import { HistoryDialog } from '@/components/map/HistoryDialog';
import { ClusterMarker } from '@/components/map/ClusterMarker';
import { RegionSelector } from '@/components/map/RegionSelector';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

interface Cluster {
  id: string;
  regionName: string;
  latitude: number;
  longitude: number;
  count: number;
  institutions: Institution[];
}

export default function MapViewPage() {
  // 카카오 지도 스크립트 로드
  useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || '',
  });

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [map, setMap] = useState<kakao.maps.Map | null>(null);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 36.5, lng: 127.5 });
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchInstitutions() {
      try {
        const response = await fetch('/api/institutions');
        if (!response.ok) {
          throw new Error('데이터를 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        setInstitutions(data);
        setDataError(null);
      } catch (error) {
        console.error('Failed to fetch institutions:', error);
        setDataError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoadingData(false);
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

  // 필터링된 기관 목록
  const filteredInstitutions = useMemo(() => {
    if (serviceTypeFilter === 'all') return institutions;
    return institutions.filter(inst => inst.serviceType === serviceTypeFilter);
  }, [institutions, serviceTypeFilter]);

  // 서비스 유형 목록 추출
  const serviceTypes = useMemo(() => {
    const types = new Set(institutions.map(inst => inst.serviceType));
    return Array.from(types).sort();
  }, [institutions]);

  // 줌 레벨에 따른 클러스터링 로직
  const clusters = useMemo(() => {
    if (!filteredInstitutions.length) return [];

    // 줌 레벨별 클러스터링 기준
    // level 13-11: 광역시/도 단위 (주소 첫 3자리 기준)
    // level 10-8: 시/군/구 단위 (주소 첫 6자리 기준)
    // level 7 이하: 개별 마커 표시

    if (zoomLevel <= 7) {
      // 상세 뷰: 개별 마커 표시
      return [];
    }

    let groupBy: (address: string) => string;

    if (zoomLevel >= 11) {
      // 광역시/도 단위
      groupBy = (address: string) => {
        // "서울특별시", "경기도", "부산광역시" 등 추출
        const match = address.match(/^([가-힣]+(?:특별시|광역시|특별자치시|도|특별자치도))/);
        return match ? match[1] : address.substring(0, 3);
      };
    } else {
      // 시/군/구 단위
      groupBy = (address: string) => {
        // "서울특별시 강남구", "경기도 성남시" 등 추출
        const match = address.match(/^([가-힣]+(?:특별시|광역시|특별자치시|도|특별자치도))\s+([가-힣]+(?:시|군|구))/);
        if (match) return `${match[1]} ${match[2]}`;
        return address.substring(0, 6);
      };
    }

    // 지역별로 그룹화
    const grouped = filteredInstitutions.reduce((acc, institution) => {
      const region = groupBy(institution.address);
      if (!acc[region]) {
        acc[region] = [];
      }
      acc[region].push(institution);
      return acc;
    }, {} as Record<string, Institution[]>);

    // 클러스터 생성
    return Object.entries(grouped).map(([regionName, institutions]) => {
      // 중심 좌표 계산 (평균)
      const avgLat = institutions.reduce((sum, i) => sum + i.latitude, 0) / institutions.length;
      const avgLng = institutions.reduce((sum, i) => sum + i.longitude, 0) / institutions.length;

      return {
        id: regionName,
        regionName,
        latitude: avgLat,
        longitude: avgLng,
        count: institutions.length,
        institutions,
      };
    });
  }, [filteredInstitutions, zoomLevel]);

  // 클러스터 클릭 핸들러
  const handleClusterClick = (cluster: Cluster) => {
    if (!map) return;

    // 클러스터 중심으로 이동하고 줌인
    const newLevel = Math.max(zoomLevel - 3, 1);
    map.setLevel(newLevel);
    map.setCenter(new kakao.maps.LatLng(cluster.latitude, cluster.longitude));
  };

  // 지역 선택 핸들러
  const handleRegionSelect = (center: { lat: number; lng: number }, level: number) => {
    if (!map) return;

    setMapCenter(center);
    map.setCenter(new kakao.maps.LatLng(center.lat, center.lng));
    map.setLevel(level);
  };

  // 로딩 상태 처리
  if (isLoadingData) {
    return (
      <div className="relative h-full bg-slate-50 dark:bg-slate-950">
        {/* 헤더 스켈레톤 */}
        <div className="absolute top-0 left-0 right-0 bg-white dark:bg-slate-800 border-b dark:border-slate-700 p-4 shadow-sm">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>

        {/* 지도 로딩 메시지 */}
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4" />
            <p className="text-slate-600 dark:text-slate-300 font-medium">데이터를 불러오는 중...</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">잠시만 기다려주세요</p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (dataError) {
    return (
      <div className="relative h-full bg-slate-50 dark:bg-slate-950">
        {/* 헤더 */}
        <div className="absolute top-0 left-0 right-0 bg-white dark:bg-slate-800 border-b dark:border-slate-700 p-4 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">지도 뷰</h1>
        </div>

        {/* 에러 메시지 */}
        <div className="flex h-full items-center justify-center">
          <div className="text-center max-w-md p-8">
            <div className="inline-block p-4 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
              <svg
                className="w-12 h-12 text-red-500 dark:text-red-400"
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
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">데이터 로드 실패</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">{dataError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen flex">
      {/* 지도 영역 */}
      <div className="flex-1 relative">
        <Map
          center={mapCenter}
          style={{ width: '100%', height: '100%' }}
          level={13}
          onCreate={setMap}
          onZoomChanged={(map) => setZoomLevel(map.getLevel())}
        >
        {/* 줌 레벨에 따른 조건부 렌더링 */}
        {zoomLevel <= 7 ? (
          // 상세 뷰: 개별 파이차트 마커 표시
          institutions.map((institution) => (
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
          ))
        ) : (
          // 광역 뷰: 클러스터 마커 표시
          clusters.map((cluster) => (
            <CustomOverlayMap
              key={cluster.id}
              position={{ lat: cluster.latitude, lng: cluster.longitude }}
            >
              <div onClick={() => handleClusterClick(cluster)}>
                <ClusterMarker count={cluster.count} />
              </div>
            </CustomOverlayMap>
          ))
        )}
        </Map>

        {/* 상단 헤더 오버레이 */}
        <div className="absolute top-0 left-0 right-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-b dark:border-slate-700 p-4 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">지도 뷰</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            전국 {institutions.length}개 장기요양기관 현황
          </p>
          <div className="flex gap-2 mt-2">
            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
              줌 레벨: {zoomLevel}
            </span>
            <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded">
              {zoomLevel <= 7 ? '개별 마커 모드' : zoomLevel >= 11 ? '광역시/도 모드' : '시/군/구 모드'}
            </span>
          </div>
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

      {/* 지역 선택 사이드 패널 */}
      <RegionSelector
        institutions={institutions}
        onRegionSelect={handleRegionSelect}
        selectedRegion={selectedRegion}
      />
    </div>
  );
}
