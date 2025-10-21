'use client'; // 이 컴포넌트는 클라이언트 측에서 렌더링됩니다.

import { Map, MapMarker, CustomOverlayMap } from 'react-kakao-maps-sdk';
import { useState, useEffect } from 'react';

// shadcn/ui 컴포넌트 임포트
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// 타입 정의
interface Institution {
  id: number;
  name: string;
  service_type: string;
  address: string;
  capacity: number;
  current_headcount: number;
  latitude: number;
  longitude: number;
}

interface HistoryData {
  date: string;
  capacity: number;
  current: number;
}

// 1. 파이그래프 마커 컴포넌트
const PieChartMarker = ({ inst }: { inst: Institution }) => {
  const ratio = inst.current_headcount / inst.capacity;
  const percentage = Math.min(ratio, 1) * 360; // 360도 기준 퍼센티지
  const color = ratio > 1 ? 'hsl(0 84.2% 60.2%)' : 'hsl(221.2 83.2% 53.3%)'; // shadcn/ui 색상 (destructive, primary)

  return (
    <div
      className="relative flex items-center justify-center w-16 h-16 rounded-full shadow-lg"
      style={{ background: `conic-gradient(${color} ${percentage}deg, #e5e7eb 0deg)` }}
    >
      <div className="absolute flex flex-col items-center justify-center w-14 h-14 bg-white rounded-full">
        <span className="text-xs font-bold text-slate-800">{inst.current_headcount}</span>
        <span className="text-[10px] text-slate-500">/ {inst.capacity}</span>
      </div>
    </div>
  );
};

// 2. 이력 조회 모달(Dialog) 컴포넌트
const HistoryDialog = ({ institutionId, institutionName }: { institutionId: number; institutionName: string }) => {
  const [history, setHistory] = useState<HistoryData[]>([]);

  const fetchHistory = async () => {
    // API 요청으로 이력 데이터 가져오기
    // const res = await fetch(`/api/v1/institutions/${institutionId}/history/`);
    // const data = await res.json();
    // setHistory(data.history);

    // --- 임시 목(mock) 데이터 ---
    setHistory([
      { date: '2025-10-01', capacity: 100, current: 85 },
      { date: '2025-11-01', capacity: 100, current: 88 },
      { date: '2025-12-01', capacity: 110, current: 95 },
    ]);
  };

  return (
    <Dialog onOpenChange={(open) => open && fetchHistory()}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full mt-2">변동 이력 보기</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{institutionName} - 정원/현원 변동 이력</DialogTitle>
        </DialogHeader>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="capacity" stroke="#8884d8" name="정원" />
              <Line type="monotone" dataKey="current" stroke="#82ca9d" name="현원" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
};


// 3. 메인 지도 컴포넌트
export default function InstitutionMap() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [activeMarker, setActiveMarker] = useState<number | null>(null);

  useEffect(() => {
    // API를 통해 기관 데이터 로드
    // fetch('/api/v1/institutions/').then(res => res.json()).then(setInstitutions);

    // --- 임시 목(mock) 데이터 ---
    setInstitutions([
      { id: 1, name: '행복요양원', service_type: '노인요양시설', address: '서울특별시 강남구', capacity: 100, current_headcount: 85, latitude: 37.5088, longitude: 127.0454 },
      { id: 2, name: '희망데이케어', service_type: '주야간보호', address: '서울특별시 서초구', capacity: 50, current_headcount: 55, latitude: 37.4837, longitude: 127.0324 },
    ]);
  }, []);

  return (
    <Map
      center={{ lat: 37.566826, lng: 126.9786567 }}
      style={{ width: '100%', height: '100vh' }}
      level={7}
      onBoundsChanged={() => setActiveMarker(null)} // 맵 이동시 팝업 닫기
    >
      {institutions.map((inst) => (
        <CustomOverlayMap
            key={inst.id}
            position={{ lat: inst.latitude, lng: inst.longitude }}
        >
            <Popover open={activeMarker === inst.id} onOpenChange={(open) => setActiveMarker(open ? inst.id : null)}>
                <PopoverTrigger asChild>
                    <div onClick={() => setActiveMarker(inst.id)} className="cursor-pointer">
                        <PieChartMarker inst={inst} />
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">{inst.name}</h4>
                        <p className="text-sm text-muted-foreground">{inst.service_type}</p>
                        <p className="text-xs">{inst.address}</p>
                        <HistoryDialog institutionId={inst.id} institutionName={inst.name} />
                    </div>
                </PopoverContent>
            </Popover>
        </CustomOverlayMap>
      ))}
    </Map>
  );
}