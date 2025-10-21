import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 특정 크롤링 작업 상세 조회
 * GET /api/admin/crawler/jobs/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await prisma.crawlerJob.findUnique({
      where: { id: params.id },
    });

    if (!job) {
      return NextResponse.json(
        { error: '작업을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('작업 조회 오류:', error);
    return NextResponse.json(
      { error: '작업 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}
