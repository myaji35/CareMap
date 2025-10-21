import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const TEMP_DIR = path.join(process.cwd(), '.crawler-temp');
const DATA_FILE = path.join(TEMP_DIR, 'crawled-data.json');
const STATUS_FILE = path.join(TEMP_DIR, 'status.json');

export async function GET() {
  try {
    // 데이터 파일 읽기
    let data = { institutions: [], timestamp: null };
    if (fs.existsSync(DATA_FILE)) {
      const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
      data = JSON.parse(fileContent);
    }

    // 상태 파일 읽기
    let status = { isCrawling: false, progress: null, error: null };
    if (fs.existsSync(STATUS_FILE)) {
      const statusContent = fs.readFileSync(STATUS_FILE, 'utf-8');
      status = JSON.parse(statusContent);
    }

    return NextResponse.json({
      institutions: data.institutions || [],
      isCrawling: status.isCrawling,
      progress: status.progress,
      error: status.error,
      count: data.institutions?.length || 0,
      timestamp: data.timestamp || new Date().toISOString(),
    });
  } catch (error) {
    console.error('크롤링 데이터 조회 오류:', error);
    return NextResponse.json(
      { error: '데이터 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}
