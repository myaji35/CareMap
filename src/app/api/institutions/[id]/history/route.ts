import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 실제 DB 연결 전까지는 임시 데이터 반환
    // const history = await prisma.institutionHistory.findMany({
    //   where: { institutionId: id },
    //   orderBy: { recordedDate: 'asc' },
    // });

    // 임시 Mock 데이터 - 시계열 분석을 위한 월별 데이터
    const baseDate = new Date('2024-01-01');
    const history = Array.from({ length: 10 }, (_, i) => {
      const date = new Date(baseDate);
      date.setMonth(date.getMonth() + i);

      // 기관별로 다른 추세 생성
      let capacity = 100;
      let currentHeadcount = 85;

      if (id === '1') {
        // 서울요양원: 안정적인 운영
        currentHeadcount = 85 + Math.floor(Math.random() * 5);
      } else if (id === '2') {
        // 부산돌봄센터: 과밀 상태
        capacity = 80;
        currentHeadcount = 88 + Math.floor(Math.random() * 8);
      } else if (id === '3') {
        // 인천실버케어: 점진적 증가
        capacity = 50;
        currentHeadcount = 30 + i * 2;
      }

      return {
        id: `hist-${id}-${i}`,
        institutionId: id,
        recordedDate: date.toISOString(),
        name: id === '1' ? '서울요양원' : id === '2' ? '부산돌봄센터' : '인천실버케어',
        address: id === '1'
          ? '서울특별시 강남구 테헤란로 123'
          : id === '2'
          ? '부산광역시 해운대구 센텀로 456'
          : '인천광역시 남동구 인주대로 789',
        capacity,
        currentHeadcount,
      };
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error('Failed to fetch institution history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch institution history' },
      { status: 500 }
    );
  }
}
