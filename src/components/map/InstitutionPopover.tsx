'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

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

interface InstitutionPopoverProps {
  institution: Institution;
  children: React.ReactNode;
  onViewHistory?: () => void;
}

export function InstitutionPopover({
  institution,
  children,
  onViewHistory,
}: InstitutionPopoverProps) {
  const occupancyRate = (
    (institution.currentHeadcount / institution.capacity) *
    100
  ).toFixed(1);
  const isOvercapacity = institution.currentHeadcount > institution.capacity;

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80" side="top" align="center">
        <div className="space-y-3">
          {/* 기관명 */}
          <div>
            <h3 className="font-bold text-lg text-slate-900">
              {institution.name}
            </h3>
            <p className="text-sm text-slate-500">{institution.serviceType}</p>
          </div>

          {/* 구분선 */}
          <div className="border-t" />

          {/* 정보 그리드 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">기관코드</span>
              <span className="font-medium text-slate-900">
                {institution.institutionCode}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-600">정원</span>
              <span className="font-medium text-slate-900">
                {institution.capacity}명
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-600">현원</span>
              <span
                className={`font-medium ${
                  isOvercapacity ? 'text-red-600' : 'text-slate-900'
                }`}
              >
                {institution.currentHeadcount}명
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-600">입소율</span>
              <span
                className={`font-bold ${
                  isOvercapacity ? 'text-red-600' : 'text-blue-600'
                }`}
              >
                {occupancyRate}%
              </span>
            </div>
          </div>

          {/* 주소 */}
          <div className="text-sm">
            <span className="text-slate-600">주소</span>
            <p className="text-slate-900 mt-1">{institution.address}</p>
          </div>

          {/* 버튼 */}
          <Button
            className="w-full"
            variant="outline"
            onClick={onViewHistory}
          >
            변동 이력 보기
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
