import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { geocodeAddress } from '@/lib/geocoding';
import { CrawledInstitution } from '@/lib/crawler';

type InstitutionInput = CrawledInstitution;

/**
 * 크롤링된 데이터를 DB에 가져오기
 * PRD USR-002, USR-003, USR-004 구현
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { institutions, jobId } = body as { institutions: InstitutionInput[]; jobId?: string };

    if (!institutions || !Array.isArray(institutions)) {
      return NextResponse.json(
        { error: '기관 데이터가 올바르지 않습니다' },
        { status: 400 }
      );
    }

    let created = 0;
    let updated = 0;
    let historyRecorded = 0;
    let failed = 0;

    console.log(`\n📦 데이터 저장 시작: 총 ${institutions.length}개 기관`);

    for (let i = 0; i < institutions.length; i++) {
      const crawledItem = institutions[i];

      // 진행률 출력 (10개마다)
      if ((i + 1) % 10 === 0 || i === institutions.length - 1) {
        const progress = Math.round(((i + 1) / institutions.length) * 100);
        console.log(`  → 진행률: ${i + 1}/${institutions.length} (${progress}%)`);
      }

      try {
        // Kakao Geocoding API를 통해 실제 좌표 변환
        const geocodingResult = await geocodeAddress(crawledItem.address);

        if (!geocodingResult) {
          console.error(
            `  ✗ Geocoding 실패: ${crawledItem.name} (${crawledItem.address})`
          );
          failed++;
          continue;
        }

        const { latitude, longitude } = geocodingResult;

        // [USR-002] 기존 기관 조회
        const existingInstitution = await prisma.institution.findUnique({
          where: { institutionCode: crawledItem.institutionCode },
        });

        if (!existingInstitution) {
          // 신규 기관 생성
          await prisma.institution.create({
            data: {
              institutionCode: crawledItem.institutionCode,
              name: crawledItem.name,
              serviceType: crawledItem.serviceType,
              capacity: crawledItem.capacity,
              currentHeadcount: crawledItem.currentHeadcount,
              address: crawledItem.address,
              latitude,
              longitude,
            },
          });
          created++;
        } else {
          // 변경사항 확인
          const hasChanges =
            existingInstitution.name !== crawledItem.name ||
            existingInstitution.address !== crawledItem.address ||
            existingInstitution.capacity !== crawledItem.capacity ||
            existingInstitution.currentHeadcount !== crawledItem.currentHeadcount;

          if (hasChanges) {
            // [USR-003] 변경사항이 있으면 현재 데이터를 이력으로 백업
            await prisma.institutionHistory.create({
              data: {
                institutionId: existingInstitution.id,
                name: existingInstitution.name,
                address: existingInstitution.address,
                capacity: existingInstitution.capacity,
                currentHeadcount: existingInstitution.currentHeadcount,
                recordedDate: new Date(),
              },
            });
            historyRecorded++;

            // [USR-004] Institution 테이블을 최신 데이터로 업데이트
            await prisma.institution.update({
              where: { id: existingInstitution.id },
              data: {
                name: crawledItem.name,
                serviceType: crawledItem.serviceType,
                capacity: crawledItem.capacity,
                currentHeadcount: crawledItem.currentHeadcount,
                address: crawledItem.address,
                latitude,
                longitude,
              },
            });
            updated++;
          }
        }

        // Rate Limiting 방지를 위한 약간의 지연
        if (i < institutions.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(
          `기관 ${crawledItem.institutionCode} 저장 실패:`,
          error
        );
        failed++;
      }
    }

    console.log(`\n✅ 데이터 저장 완료!`);
    console.log(`  - 신규 생성: ${created}개`);
    console.log(`  - 업데이트: ${updated}개`);
    console.log(`  - 이력 기록: ${historyRecorded}개`);
    console.log(`  - 실패: ${failed}개`);
    console.log(`  - 총 처리: ${institutions.length}개\n`);

    // Job ID가 있으면 DB 업데이트
    if (jobId) {
      await prisma.crawlerJob.update({
        where: { id: jobId },
        data: {
          savedToDb: true,
          createdCount: created,
          updatedCount: updated,
          failedCount: failed,
        },
      });
      console.log(`📝 작업 이력 업데이트 완료 (Job ID: ${jobId})\n`);
    }

    return NextResponse.json({
      status: 'success',
      created,
      updated,
      historyRecorded,
      failed,
      total: institutions.length,
      message: `${created}개 신규 생성, ${updated}개 업데이트, ${historyRecorded}개 이력 기록${failed > 0 ? ` (${failed}개 실패)` : ''}`,
    });
  } catch (error) {
    console.error('데이터 가져오기 오류:', error);
    return NextResponse.json(
      { error: '데이터 가져오기에 실패했습니다' },
      { status: 500 }
    );
  }
}
