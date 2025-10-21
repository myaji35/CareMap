import { NextResponse } from 'next/server';
import { getTotalPages } from '@/lib/crawler';

export async function GET() {
  try {
    const totalPages = await getTotalPages();

    return NextResponse.json({
      totalPages,
      success: true,
    });
  } catch (error) {
    console.error('전체 페이지 수 조회 오류:', error);
    return NextResponse.json(
      {
        error: '전체 페이지 수를 가져오는데 실패했습니다',
        totalPages: 1,
        success: false,
      },
      { status: 500 }
    );
  }
}
