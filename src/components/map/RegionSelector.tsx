'use client';

import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, MapPin, Map as MapIcon } from 'lucide-react';

interface RegionSelectorProps {
  institutions: Array<{
    address: string;
    latitude: number;
    longitude: number;
  }>;
  onRegionSelect: (center: { lat: number; lng: number }, level: number) => void;
  selectedRegion: string | null;
}

// 광역시/도 데이터
const PROVINCES: Record<string, { center: { lat: number; lng: number }; level: number }> = {
  '서울특별시': { center: { lat: 37.5665, lng: 126.9780 }, level: 8 },
  '부산광역시': { center: { lat: 35.1796, lng: 129.0756 }, level: 8 },
  '대구광역시': { center: { lat: 35.8714, lng: 128.6014 }, level: 8 },
  '인천광역시': { center: { lat: 37.4563, lng: 126.7052 }, level: 8 },
  '광주광역시': { center: { lat: 35.1595, lng: 126.8526 }, level: 8 },
  '대전광역시': { center: { lat: 36.3504, lng: 127.3845 }, level: 8 },
  '울산광역시': { center: { lat: 35.5384, lng: 129.3114 }, level: 8 },
  '세종특별자치시': { center: { lat: 36.4800, lng: 127.2890 }, level: 8 },
  '경기도': { center: { lat: 37.4138, lng: 127.5183 }, level: 9 },
  '강원특별자치도': { center: { lat: 37.8228, lng: 128.1555 }, level: 9 },
  '충청북도': { center: { lat: 36.6357, lng: 127.4917 }, level: 9 },
  '충청남도': { center: { lat: 36.5184, lng: 126.8000 }, level: 9 },
  '전북특별자치도': { center: { lat: 35.7175, lng: 127.1530 }, level: 9 },
  '전라남도': { center: { lat: 34.8679, lng: 126.9910 }, level: 9 },
  '경상북도': { center: { lat: 36.4919, lng: 128.8889 }, level: 9 },
  '경상남도': { center: { lat: 35.4606, lng: 128.2132 }, level: 9 },
  '제주특별자치도': { center: { lat: 33.4890, lng: 126.4983 }, level: 9 },
};

export function RegionSelector({ institutions, onRegionSelect, selectedRegion }: RegionSelectorProps) {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [expandedProvince, setExpandedProvince] = useState<string | null>(null);

  // 기관 데이터로부터 지역 통계 생성
  const regionStats = useMemo(() => {
    const stats: Record<string, { count: number; districts: Record<string, number> }> = {};

    institutions.forEach((institution) => {
      // 광역시/도 추출
      const provinceMatch = institution.address.match(/^([가-힣]+(?:특별시|광역시|특별자치시|도|특별자치도))/);
      if (!provinceMatch) return;

      const province = provinceMatch[1];

      // 시/군/구 추출
      const districtMatch = institution.address.match(/^[가-힣]+(?:특별시|광역시|특별자치시|도|특별자치도)\s+([가-힣]+(?:시|군|구))/);
      const district = districtMatch ? districtMatch[1] : '기타';

      if (!stats[province]) {
        stats[province] = { count: 0, districts: {} };
      }

      stats[province].count++;
      stats[province].districts[district] = (stats[province].districts[district] || 0) + 1;
    });

    return stats;
  }, [institutions]);

  const handleProvinceClick = (provinceName: string) => {
    const province = PROVINCES[provinceName];
    if (province) {
      onRegionSelect(province.center, province.level);
      setExpandedProvince(expandedProvince === provinceName ? null : provinceName);
    }
  };

  const handleDistrictClick = (provinceName: string, districtName: string) => {
    // 시/군/구 클릭 시 해당 지역으로 이동 (더 확대)
    const province = PROVINCES[provinceName];
    if (province) {
      onRegionSelect(province.center, 7); // 더 상세한 레벨
    }
  };

  const handleNationalView = () => {
    onRegionSelect({ lat: 36.5, lng: 127.5 }, 13);
    setExpandedProvince(null);
  };

  return (
    <div className="w-80 h-full bg-white border-l shadow-sm flex flex-col">
      {/* 헤더 */}
      <div className="p-4 border-b bg-slate-50">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          지역 선택
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          전국 {institutions.length}개 기관
        </p>
      </div>

      {/* 전국 보기 버튼 */}
      <div className="p-3 border-b">
        <button
          onClick={handleNationalView}
          className={`w-full px-4 py-2 rounded-lg text-left font-medium transition-colors ${
            selectedRegion === null
              ? 'bg-blue-100 text-blue-700'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span>🇰🇷 전국 보기</span>
            <span className="text-sm">{institutions.length}개</span>
          </div>
        </button>
      </div>

      {/* 지역 목록 */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {Object.entries(regionStats).map(([provinceName, data]) => (
            <div key={provinceName} className="border rounded-lg overflow-hidden">
              {/* 광역시/도 */}
              <button
                onClick={() => handleProvinceClick(provinceName)}
                className={`w-full px-3 py-2 text-left transition-colors ${
                  selectedRegion === provinceName
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {expandedProvince === provinceName ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="font-medium text-sm">{provinceName}</span>
                  </div>
                  <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                    {data.count}개
                  </span>
                </div>
              </button>

              {/* 시/군/구 목록 */}
              {expandedProvince === provinceName && (
                <div className="bg-slate-50 border-t">
                  {Object.entries(data.districts).map(([districtName, count]) => (
                    <button
                      key={districtName}
                      onClick={() => handleDistrictClick(provinceName, districtName)}
                      className="w-full px-3 py-2 pl-9 text-left hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700">{districtName}</span>
                        <span className="text-xs text-slate-500">{count}개</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 하단 통계 */}
      <div className="p-3 border-t bg-slate-50 text-xs text-slate-600">
        <div className="flex justify-between">
          <span>광역시/도</span>
          <span className="font-medium">{Object.keys(regionStats).length}개</span>
        </div>
      </div>
    </div>
  );
}
