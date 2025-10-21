import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { geocodeAddress } from '@/lib/geocoding';

/**
 * 좌표가 없는 기관들의 좌표를 일괄 업데이트하는 API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { limit = 50 } = body;

    // 좌표가 없는 기관 조회
    const institutionsWithoutCoordinates = await prisma.institution.findMany({
      where: {
        OR: [
          { latitude: 0 },
          { longitude: 0 },
        ],
      },
      take: limit,
      select: {
        id: true,
        institutionCode: true,
        name: true,
        address: true,
      },
    });

    if (institutionsWithoutCoordinates.length === 0) {
      return NextResponse.json({
        status: 'success',
        message: '좌표가 필요한 기관이 없습니다',
        updated: 0,
        failed: 0,
      });
    }

    let updated = 0;
    let failed = 0;
    const errors: string[] = [];

    console.log(`\n🌍 좌표 업데이트 시작: ${institutionsWithoutCoordinates.length}개 기관`);

    for (let i = 0; i < institutionsWithoutCoordinates.length; i++) {
      const institution = institutionsWithoutCoordinates[i];

      try {
        // 진행률 출력 (10개마다)
        if ((i + 1) % 10 === 0 || i === institutionsWithoutCoordinates.length - 1) {
          const progress = Math.round(((i + 1) / institutionsWithoutCoordinates.length) * 100);
          console.log(`  → 진행률: ${i + 1}/${institutionsWithoutCoordinates.length} (${progress}%)`);
        }

        // Kakao Geocoding API 호출
        const geocodingResult = await geocodeAddress(institution.address);

        if (!geocodingResult) {
          console.error(`  ✗ Geocoding 실패: ${institution.name} (${institution.address})`);
          errors.push(`${institution.name}: Geocoding 실패`);
          failed++;
          continue;
        }

        // DB 업데이트
        await prisma.institution.update({
          where: { id: institution.id },
          data: {
            latitude: geocodingResult.latitude,
            longitude: geocodingResult.longitude,
          },
        });

        updated++;

        // Rate Limiting 방지를 위한 지연
        if (i < institutionsWithoutCoordinates.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`기관 ${institution.institutionCode} 좌표 업데이트 실패:`, error);
        errors.push(`${institution.name}: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        failed++;
      }
    }

    console.log(`\n✅ 좌표 업데이트 완료!`);
    console.log(`  - 성공: ${updated}개`);
    console.log(`  - 실패: ${failed}개`);
    console.log(`  - 총 처리: ${institutionsWithoutCoordinates.length}개\n`);

    return NextResponse.json({
      status: 'success',
      updated,
      failed,
      total: institutionsWithoutCoordinates.length,
      errors: errors.slice(0, 10), // 처음 10개 에러만 반환
      message: `${updated}개 기관 좌표 업데이트 완료${failed > 0 ? ` (${failed}개 실패)` : ''}`,
    });
  } catch (error) {
    console.error('좌표 업데이트 오류:', error);
    return NextResponse.json(
      { error: '좌표 업데이트에 실패했습니다' },
      { status: 500 }
    );
  }
}
