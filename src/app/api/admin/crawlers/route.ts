import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 크롤러 목록 조회
export async function GET() {
  try {
    const crawlers = await prisma.crawler.findMany({
      include: {
        jobs: {
          orderBy: { startedAt: 'desc' },
          take: 1, // 최근 작업만
        },
        _count: {
          select: { jobs: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ crawlers });
  } catch (error) {
    console.error('크롤러 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '크롤러 목록을 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}

// POST: 새 크롤러 등록
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, url, description } = body;

    console.log('크롤러 등록 시도:', { name, url, description });

    if (!name || !url) {
      return NextResponse.json(
        { error: '이름과 URL은 필수 항목입니다' },
        { status: 400 }
      );
    }

    const crawler = await prisma.crawler.create({
      data: {
        name,
        url,
        description: description || null,
      },
    });

    console.log('크롤러 등록 성공:', crawler);
    return NextResponse.json({ crawler }, { status: 201 });
  } catch (error) {
    console.error('크롤러 등록 오류 상세:', error);
    return NextResponse.json(
      {
        error: '크롤러 등록에 실패했습니다',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}
