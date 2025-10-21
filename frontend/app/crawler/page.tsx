'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface CrawlerLog {
  timestamp: string;
  level: 'info' | 'success' | 'error' | 'warning';
  message: string;
}

export default function CrawlerPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<CrawlerLog[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
    updated: 0,
  });

  // 관리자 권한 체크
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
    } else if (session.user.userType !== 'ADMIN') {
      alert('관리자 권한이 필요합니다.');
      router.push('/');
    }
  }, [session, status, router]);

  const addLog = (level: CrawlerLog['level'], message: string) => {
    const newLog: CrawlerLog = {
      timestamp: new Date().toLocaleTimeString('ko-KR'),
      level,
      message,
    };
    setLogs((prev) => [...prev, newLog]);
  };

  const handleStartCrawler = async () => {
    setIsRunning(true);
    setLogs([]);
    setStats({ total: 0, success: 0, failed: 0, updated: 0 });

    addLog('info', '크롤러를 시작합니다...');

    try {
      // TODO: 실제 API 엔드포인트 연동
      // const response = await fetch('/api/crawler/start', { method: 'POST' });

      // 현재는 시뮬레이션
      await simulateCrawler();

      addLog('success', '크롤링이 완료되었습니다.');
    } catch (error) {
      addLog('error', `크롤링 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsRunning(false);
    }
  };

  // 크롤러 시뮬레이션 (실제 구현 시 제거)
  const simulateCrawler = async () => {
    const steps = [
      { delay: 500, log: '데이터베이스 연결 중...', level: 'info' as const },
      { delay: 800, log: '웹사이트 접속 중...', level: 'info' as const },
      { delay: 1000, log: '페이지 1/10 크롤링 중...', level: 'info' as const, stats: { total: 10 } },
      { delay: 1000, log: '10개 기관 정보 수집 완료', level: 'success' as const, stats: { success: 10 } },
      { delay: 800, log: '주소 좌표 변환 중...', level: 'info' as const },
      { delay: 1000, log: '10개 기관 좌표 변환 완료', level: 'success' as const },
      { delay: 1000, log: '데이터베이스 동기화 중...', level: 'info' as const },
      { delay: 1200, log: '5개 기관 신규 등록, 3개 기관 정보 업데이트', level: 'success' as const, stats: { updated: 3 } },
      { delay: 500, log: '모든 작업이 완료되었습니다.', level: 'success' as const },
    ];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, step.delay));
      addLog(step.level, step.log);
      if (step.stats) {
        setStats((prev) => ({ ...prev, ...step.stats }));
      }
    }
  };

  const getLogColor = (level: CrawlerLog['level']) => {
    switch (level) {
      case 'info':
        return 'text-blue-700';
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      case 'warning':
        return 'text-yellow-700';
    }
  };

  const getLogBgColor = (level: CrawlerLog['level']) => {
    switch (level) {
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← 돌아가기
          </button>
          <h1 className="text-2xl font-bold text-gray-800">데이터 크롤링 관리</h1>
        </div>
        <div className="text-sm text-gray-600">
          관리자: <span className="font-semibold text-blue-600">{user?.username}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">총 처리</div>
            <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">성공</div>
            <div className="text-3xl font-bold text-green-600">{stats.success}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">업데이트</div>
            <div className="text-3xl font-bold text-blue-600">{stats.updated}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">실패</div>
            <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
          </div>
        </div>

        {/* 크롤러 컨트롤 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">크롤러 실행</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handleStartCrawler}
              disabled={isRunning}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                isRunning
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isRunning ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  실행 중...
                </>
              ) : (
                '크롤링 시작'
              )}
            </button>
            <div className="text-sm text-gray-600">
              {isRunning ? '크롤러가 실행 중입니다...' : '버튼을 클릭하여 크롤링을 시작하세요'}
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <p>※ 크롤링은 전국 장기요양기관 정보를 수집하여 데이터베이스에 저장합니다.</p>
            <p>※ 크롤링 시간은 데이터 양에 따라 수 분에서 수십 분이 소요될 수 있습니다.</p>
          </div>
        </div>

        {/* 로그 출력 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">실행 로그</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                아직 실행된 로그가 없습니다
              </div>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`px-4 py-2 rounded border ${getLogBgColor(log.level)}`}
                >
                  <span className="text-xs text-gray-500 mr-3">{log.timestamp}</span>
                  <span className={`font-mono text-sm ${getLogColor(log.level)}`}>
                    [{log.level.toUpperCase()}]
                  </span>
                  <span className="ml-2 text-sm text-gray-700">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
