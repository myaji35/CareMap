import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 대시보드 통계 API
 * - 총 기관 수
 * - 총 이력 기록 수
 * - 최근 30일 변경 건수
 * - 최근 크롤링 작업 정보
 */
export async function GET() {
  try {
    // 총 기관 수
    const totalInstitutions = await prisma.institution.count();

    // 총 이력 기록 수
    const totalHistoryRecords = await prisma.institutionHistory.count();

    // 최근 30일 변경 건수
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentChanges = await prisma.institutionHistory.count({
      where: {
        recordedDate: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // 최근 크롤링 작업 (완료된 작업만)
    const lastCrawlerJob = await prisma.crawlerJob.findFirst({
      where: {
        status: 'completed',
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    // 서비스 유형별 통계
    const serviceTypeStats = await prisma.institution.groupBy({
      by: ['serviceType'],
      _count: {
        serviceType: true,
      },
    });

    // 정원 대비 현원 통계
    const institutions = await prisma.institution.findMany({
      select: {
        capacity: true,
        currentHeadcount: true,
      },
    });

    const totalCapacity = institutions.reduce((sum, inst) => sum + inst.capacity, 0);
    const totalCurrentHeadcount = institutions.reduce((sum, inst) => sum + inst.currentHeadcount, 0);
    const occupancyRate = totalCapacity > 0 ? (totalCurrentHeadcount / totalCapacity) * 100 : 0;

    // 정원 초과 기관 수
    const overCapacityCount = institutions.filter(
      (inst) => inst.currentHeadcount > inst.capacity
    ).length;

    return NextResponse.json({
      totalInstitutions,
      totalHistoryRecords,
      recentChanges,
      lastCrawlerJob: lastCrawlerJob
        ? {
            completedAt: lastCrawlerJob.completedAt,
            crawledCount: lastCrawlerJob.crawledCount,
            createdCount: lastCrawlerJob.createdCount,
            updatedCount: lastCrawlerJob.updatedCount,
          }
        : null,
      serviceTypeStats: serviceTypeStats.map((stat) => ({
        serviceType: stat.serviceType,
        count: stat._count.serviceType,
      })),
      capacityStats: {
        totalCapacity,
        totalCurrentHeadcount,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        overCapacityCount,
      },
    });
  } catch (error) {
    console.error('대시보드 통계 조회 오류:', error);
    return NextResponse.json(
      { error: '통계 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}
