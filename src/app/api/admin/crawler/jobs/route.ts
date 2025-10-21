import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 크롤링 작업 이력 조회
 * GET /api/admin/crawler/jobs
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status'); // 'running', 'completed', 'failed'

    const where = status ? { status } : {};

    const jobs = await prisma.crawlerJob.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      take: limit,
    });

    // 현재 실행 중인 작업 조회
    const currentJob = await prisma.crawlerJob.findFirst({
      where: { status: 'running' },
      orderBy: { startedAt: 'desc' },
    });

    return NextResponse.json({
      jobs,
      currentJob,
      total: await prisma.crawlerJob.count({ where }),
    });
  } catch (error) {
    console.error('작업 이력 조회 오류:', error);
    return NextResponse.json(
      { error: '작업 이력 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}
