import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 데이터베이스 상태 확인 API
 * - 총 기관 수
 * - 좌표가 설정된 기관 수
 * - 좌표가 없는 기관 수
 * - 최근 추가된 기관
 */
export async function GET() {
  try {
    // 총 기관 수
    const totalInstitutions = await prisma.institution.count();

    // 좌표가 설정된 기관 수 (위도/경도가 0이 아닌 경우)
    const institutionsWithCoordinates = await prisma.institution.count({
      where: {
        AND: [
          { latitude: { not: 0 } },
          { longitude: { not: 0 } },
        ],
      },
    });

    // 좌표가 없는 기관 수
    const institutionsWithoutCoordinates = totalInstitutions - institutionsWithCoordinates;

    // 최근 추가된 기관 (10개)
    const recentInstitutions = await prisma.institution.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        institutionCode: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
        createdAt: true,
      },
    });

    // 좌표가 없는 기관 목록 (처음 20개)
    const institutionsNeedingCoordinates = await prisma.institution.findMany({
      where: {
        OR: [
          { latitude: 0 },
          { longitude: 0 },
        ],
      },
      take: 20,
      select: {
        id: true,
        institutionCode: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
      },
    });

    return NextResponse.json({
      totalInstitutions,
      institutionsWithCoordinates,
      institutionsWithoutCoordinates,
      coordinateCompletionRate: totalInstitutions > 0
        ? Math.round((institutionsWithCoordinates / totalInstitutions) * 100 * 100) / 100
        : 0,
      recentInstitutions,
      institutionsNeedingCoordinates,
    });
  } catch (error) {
    console.error('데이터베이스 상태 조회 오류:', error);
    return NextResponse.json(
      { error: '데이터베이스 상태 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}
