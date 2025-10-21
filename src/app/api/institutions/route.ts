import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 데이터베이스에서 좌표가 있는 기관만 조회 (지도에 표시 가능한 기관)
    const institutions = await prisma.institution.findMany({
      where: {
        AND: [
          { latitude: { not: 0 } },
          { longitude: { not: 0 } },
        ],
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        institutionCode: true,
        name: true,
        serviceType: true,
        capacity: true,
        currentHeadcount: true,
        address: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(institutions);
  } catch (error) {
    console.error('Failed to fetch institutions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch institutions' },
      { status: 500 }
    );
  }
}
