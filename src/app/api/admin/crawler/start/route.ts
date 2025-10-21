import { NextRequest, NextResponse } from 'next/server';
import { crawlInstitutions } from '@/lib/crawler';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

const TEMP_DIR = path.join(process.cwd(), '.crawler-temp');
const DATA_FILE = path.join(TEMP_DIR, 'crawled-data.json');
const STATUS_FILE = path.join(TEMP_DIR, 'status.json');

// 임시 디렉토리 생성
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { maxPages = 1, crawlerId } = body;

    // 상태 확인
    let status: any = { isCrawling: false };
    if (fs.existsSync(STATUS_FILE)) {
      const statusContent = fs.readFileSync(STATUS_FILE, 'utf-8');
      status = JSON.parse(statusContent);

      // 크롤링 중이지만 5분 이상 진행 상태 업데이트가 없으면 초기화
      if (status.isCrawling && status.lastUpdate) {
        const lastUpdateTime = new Date(status.lastUpdate).getTime();
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;

        if (now - lastUpdateTime > fiveMinutes) {
          console.log('⚠ 크롤링 상태가 5분 이상 업데이트되지 않음 - 상태 초기화');
          status.isCrawling = false;
        }
      }
    }

    // DB에서 실행 중인 작업 확인
    const runningJob = await prisma.crawlerJob.findFirst({
      where: { status: 'running' },
      orderBy: { startedAt: 'desc' },
    });

    if (runningJob || status.isCrawling) {
      return NextResponse.json(
        { error: '크롤링이 이미 실행 중입니다. 잠시 후 다시 시도하거나 "중지" 버튼을 클릭하세요.' },
        { status: 409 }
      );
    }

    // DB에 새 작업 기록 생성
    const job = await prisma.crawlerJob.create({
      data: {
        crawlerId: crawlerId || null,
        status: 'running',
        totalPages: maxPages,
        crawledCount: 0,
      },
    });

    console.log(`\n🚀 크롤링 작업 시작 (Job ID: ${job.id})`);
    console.log(`   - 총 페이지: ${maxPages}`);
    console.log(`   - 시작 시간: ${job.startedAt.toISOString()}\n`);

    // 크롤링 상태 업데이트
    fs.writeFileSync(STATUS_FILE, JSON.stringify({
      isCrawling: true,
      jobId: job.id,
      lastUpdate: new Date().toISOString()
    }));
    fs.writeFileSync(DATA_FILE, JSON.stringify({ institutions: [] }));

    // 백그라운드에서 크롤링 실행
    crawlInstitutions(maxPages, async (progress) => {
      // 진행 상태를 status.json과 DB에 저장
      const statusData = {
        isCrawling: true,
        jobId: job.id,
        lastUpdate: new Date().toISOString(),
        progress: {
          current: progress.current,
          total: progress.total,
          percentage: progress.percentage,
          message: progress.message,
        },
      };
      fs.writeFileSync(STATUS_FILE, JSON.stringify(statusData));

      // DB 업데이트
      await prisma.crawlerJob.update({
        where: { id: job.id },
        data: { crawledCount: progress.current },
      });

      console.log(
        `[크롤링 진행] ${progress.percentage}% - ${progress.message}`
      );
    })
      .then(async (institutions) => {
        fs.writeFileSync(
          DATA_FILE,
          JSON.stringify({ institutions, timestamp: new Date().toISOString(), jobId: job.id })
        );
        fs.writeFileSync(
          STATUS_FILE,
          JSON.stringify({
            isCrawling: false,
            jobId: job.id,
            progress: {
              current: maxPages,
              total: maxPages,
              percentage: 100,
              message: `크롤링 완료: ${institutions.length}개 기관 수집`,
            },
          })
        );

        // DB 작업 완료 처리
        await prisma.crawlerJob.update({
          where: { id: job.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
            crawledCount: institutions.length,
          },
        });

        console.log(`✅ 크롤링 완료 (Job ID: ${job.id})`);
        console.log(`   - 수집 기관 수: ${institutions.length}`);
        console.log(`   - 완료 시간: ${new Date().toISOString()}\n`);
      })
      .catch(async (error) => {
        console.error('❌ 크롤링 실패:', error);

        // DB 작업 실패 처리
        await prisma.crawlerJob.update({
          where: { id: job.id },
          data: {
            status: 'failed',
            completedAt: new Date(),
            errorMessage: error instanceof Error ? error.message : '알 수 없는 오류',
          },
        });

        fs.writeFileSync(
          STATUS_FILE,
          JSON.stringify({
            isCrawling: false,
            jobId: job.id,
            progress: null,
            error: error instanceof Error ? error.message : '알 수 없는 오류',
          })
        );
        fs.writeFileSync(DATA_FILE, JSON.stringify({ institutions: [] }));
      });

    return NextResponse.json({
      status: 'started',
      message: '크롤링이 시작되었습니다',
      maxPages,
      jobId: job.id,
    });
  } catch (error) {
    console.error('크롤러 시작 오류:', error);
    fs.writeFileSync(STATUS_FILE, JSON.stringify({ isCrawling: false }));
    return NextResponse.json(
      { error: '크롤러 시작에 실패했습니다' },
      { status: 500 }
    );
  }
}
