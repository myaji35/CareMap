import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const TEMP_DIR = path.join(process.cwd(), '.crawler-temp');
const STATUS_FILE = path.join(TEMP_DIR, 'status.json');

export async function POST() {
  try {
    // 크롤링 상태 리셋
    if (fs.existsSync(STATUS_FILE)) {
      fs.writeFileSync(STATUS_FILE, JSON.stringify({ isCrawling: false }));
      console.log('✅ 크롤링 중지 요청 처리됨');
    }

    return NextResponse.json({
      status: 'stopped',
      message: '크롤링이 중지되었습니다',
    });
  } catch (error) {
    console.error('크롤러 중지 오류:', error);
    return NextResponse.json(
      { error: '크롤러 중지에 실패했습니다' },
      { status: 500 }
    );
  }
}
