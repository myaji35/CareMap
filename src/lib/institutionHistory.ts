/**
 * 기관 데이터 비교 및 이력 관리 유틸리티
 * PRD USR-002, USR-003, USR-004 구현
 */

import { prisma } from '@/lib/prisma';
import { CrawledInstitution } from './crawler';

export type Institution = {
  id: string;
  institutionCode: string;
  name: string;
  serviceType: string;
  capacity: number;
  currentHeadcount: number;
  address: string;
  latitude: number;
  longitude: number;
};

/**
 * 크롤링된 데이터와 DB의 기존 데이터를 비교하여 변경사항을 감지하고 이력을 기록합니다.
 * [USR-002] 크롤링된 데이터를 DB의 Institution 테이블과 비교
 * [USR-003] 변경 감지 시 InstitutionHistory 테이블로 백업
 * [USR-004] Institution 테이블은 최신 데이터로 업데이트
 */
export async function upsertInstitutionsWithHistory(
  crawledData: CrawledInstitution[]
): Promise<{
  created: number;
  updated: number;
  historyRecorded: number;
  errors: string[];
}> {
  const results = {
    created: 0,
    updated: 0,
    historyRecorded: 0,
    errors: [] as string[],
  };

  for (const crawledItem of crawledData) {
    try {
      // 기존 기관 조회
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
            latitude: 0, // Geocoding API로 별도 업데이트 필요
            longitude: 0,
          },
        });
        results.created++;
      } else {
        // [USR-002] 기존 데이터와 비교
        const hasChanges = hasInstitutionChanged(existingInstitution, crawledItem);

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
          results.historyRecorded++;

          // [USR-004] Institution 테이블을 최신 데이터로 업데이트
          await prisma.institution.update({
            where: { id: existingInstitution.id },
            data: {
              name: crawledItem.name,
              serviceType: crawledItem.serviceType,
              capacity: crawledItem.capacity,
              currentHeadcount: crawledItem.currentHeadcount,
              address: crawledItem.address,
            },
          });
          results.updated++;
        }
      }
    } catch (error) {
      const errorMessage = `기관 ${crawledItem.institutionCode} 처리 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`;
      console.error(errorMessage);
      results.errors.push(errorMessage);
    }
  }

  return results;
}

/**
 * [USR-002] 기관 데이터 변경 여부 확인
 * 상호명, 주소, 정원, 현원 중 하나라도 변경되었는지 확인
 */
function hasInstitutionChanged(
  existing: Institution,
  crawled: CrawledInstitution
): boolean {
  return (
    existing.name !== crawled.name ||
    existing.address !== crawled.address ||
    existing.capacity !== crawled.capacity ||
    existing.currentHeadcount !== crawled.currentHeadcount
  );
}

/**
 * 특정 기관의 변경 이력 조회
 */
export async function getInstitutionHistory(institutionId: string) {
  return await prisma.institutionHistory.findMany({
    where: { institutionId },
    orderBy: { recordedDate: 'desc' },
  });
}

/**
 * 모든 기관의 최근 이력 통계
 */
export async function getHistoryStats() {
  const totalInstitutions = await prisma.institution.count();
  const totalHistoryRecords = await prisma.institutionHistory.count();
  const recentChanges = await prisma.institutionHistory.count({
    where: {
      recordedDate: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 최근 30일
      },
    },
  });

  return {
    totalInstitutions,
    totalHistoryRecords,
    recentChanges,
  };
}
