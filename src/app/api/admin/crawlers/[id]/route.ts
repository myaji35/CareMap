import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 특정 크롤러 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const crawler = await prisma.crawler.findUnique({
      where: { id },
      include: {
        jobs: {
          orderBy: { startedAt: 'desc' },
          take: 10, // 최근 10개 작업
        },
        _count: {
          select: { jobs: true },
        },
      },
    });

    if (!crawler) {
      return NextResponse.json(
        { error: '크롤러를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json({ crawler });
  } catch (error) {
    console.error('크롤러 조회 오류:', error);
    return NextResponse.json(
      { error: '크롤러 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

// PATCH: 크롤러 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, url, description, isActive } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (url !== undefined) updateData.url = url;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    const crawler = await prisma.crawler.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ crawler });
  } catch (error) {
    console.error('크롤러 수정 오류:', error);
    return NextResponse.json(
      { error: '크롤러 수정에 실패했습니다' },
      { status: 500 }
    );
  }
}

// DELETE: 크롤러 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.crawler.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('크롤러 삭제 오류:', error);
    return NextResponse.json(
      { error: '크롤러 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}
