import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 실제 DB 연결 전까지는 임시 데이터 반환
    // const institutions = await prisma.institution.findMany({
    //   orderBy: { name: 'asc' },
    // });

    // 임시 Mock 데이터
    const institutions = [
      {
        id: '1',
        institutionCode: 'INST001',
        name: '서울요양원',
        serviceType: '노인요양시설',
        capacity: 100,
        currentHeadcount: 85,
        address: '서울특별시 강남구 테헤란로 123',
        latitude: 37.5012,
        longitude: 127.0396,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        institutionCode: 'INST002',
        name: '부산돌봄센터',
        serviceType: '노인요양시설',
        capacity: 80,
        currentHeadcount: 92,
        address: '부산광역시 해운대구 센텀로 456',
        latitude: 35.1689,
        longitude: 129.1305,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        institutionCode: 'INST003',
        name: '인천실버케어',
        serviceType: '주야간보호시설',
        capacity: 50,
        currentHeadcount: 45,
        address: '인천광역시 남동구 인주대로 789',
        latitude: 37.4469,
        longitude: 126.7308,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json(institutions);
  } catch (error) {
    console.error('Failed to fetch institutions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch institutions' },
      { status: 500 }
    );
  }
}
