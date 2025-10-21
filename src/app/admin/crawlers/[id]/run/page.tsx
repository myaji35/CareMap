'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type Crawler = {
  id: string;
  name: string;
  url: string;
  description: string | null;
};

type CrawlerStatus = 'idle' | 'running' | 'completed' | 'error';

type CrawledData = {
  institutionCode: string;
  name: string;
  serviceType: string;
  address: string;
  capacity: number;
  currentHeadcount: number;
};

export default function CrawlerRunPage() {
  const params = useParams();
  const router = useRouter();
  const crawlerId = params?.id as string;

  const [crawler, setCrawler] = useState<Crawler | null>(null);
  const [status, setStatus] = useState<CrawlerStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [crawledData, setCrawledData] = useState<CrawledData[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [maxPages, setMaxPages] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [loadingTotalPages, setLoadingTotalPages] = useState(false);
  const [importing, setImporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCrawlPages, setTotalCrawlPages] = useState(0);
  const [autoSave, setAutoSave] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('ko-KR');
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 50));
  };

  // 크롤러 정보 로드
  useEffect(() => {
    if (!crawlerId) return;

    fetch(`/api/admin/crawlers/${crawlerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.crawler) {
          setCrawler(data.crawler);
          addLog(`크롤러 로드: ${data.crawler.name}`);
        }
      })
      .catch((error) => {
        console.error('크롤러 로드 오류:', error);
        addLog('크롤러 정보를 불러오는데 실패했습니다');
      });
  }, [crawlerId]);

  const fetchTotalPages = async () => {
    setLoadingTotalPages(true);
    addLog('전체 페이지 수 조회 중... (이 작업은 10-20초 정도 소요됩니다)');

    try {
      const response = await fetch('/api/admin/crawler/total-pages');
      const data = await response.json();

      if (data.success) {
        setTotalPages(data.totalPages);
        addLog(`✓ 전체 페이지 수: ${data.totalPages}페이지`);
      } else {
        addLog('✗ 페이지 수 조회 실패 - 기본값 사용');
        setTotalPages(null);
      }
    } catch (error) {
      addLog('✗ 페이지 수 조회 오류 - 기본값 사용');
      setTotalPages(null);
    } finally {
      setLoadingTotalPages(false);
    }
  };

  const startCrawler = async () => {
    setStatus('running');
    setProgress(0);
    setCurrentPage(0);
    setTotalCrawlPages(maxPages);
    setCrawledData([]);
    addLog('크롤링 시작...');
    addLog(`대상 URL: ${crawler?.url}`);
    addLog(`페이지 수: ${maxPages}`);

    try {
      const response = await fetch('/api/admin/crawler/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxPages, crawlerId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류' }));
        throw new Error(errorData.error || `크롤링 시작 실패 (${response.status})`);
      }

      const result = await response.json();
      if (result.jobId) {
        setCurrentJobId(result.jobId);
        addLog(`작업 ID: ${result.jobId}`);
      }

      // 실시간 진행 상태 폴링
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch('/api/admin/crawler/data');
          const statusData = await statusResponse.json();

          if (statusData.progress) {
            setProgress(statusData.progress.percentage);
            setCurrentPage(statusData.progress.current);
            setTotalCrawlPages(statusData.progress.total);

            if (statusData.progress.message) {
              setLogs((prev) => {
                const lastLog = prev[0];
                if (!lastLog || !lastLog.includes(statusData.progress.message)) {
                  const timestamp = new Date().toLocaleTimeString('ko-KR');
                  return [`[${timestamp}] ${statusData.progress.message}`, ...prev].slice(0, 50);
                }
                return prev;
              });
            }
          }

          if (!statusData.isCrawling) {
            clearInterval(pollInterval);
            if (statusData.error) {
              setStatus('error');
              addLog(`오류 발생: ${statusData.error}`);
            } else {
              fetchCrawledData();
            }
          }
        } catch (pollError) {
          console.error('진행 상태 조회 오류:', pollError);
        }
      }, 1500);
    } catch (error) {
      setStatus('error');
      addLog(`오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  const fetchCrawledData = async () => {
    try {
      const response = await fetch('/api/admin/crawler/data');
      const data = await response.json();
      setCrawledData(data.institutions || []);
      setStatus('completed');
      addLog(`크롤링 완료: ${data.institutions?.length || 0}개 기관 수집`);

      if (autoSave && data.institutions && data.institutions.length > 0) {
        addLog('자동 저장 시작...');
        setTimeout(() => importData(), 1000);
      }
    } catch (error) {
      setStatus('error');
      addLog('데이터 조회 실패');
    }
  };

  const stopCrawler = async () => {
    try {
      await fetch('/api/admin/crawler/stop', { method: 'POST' });
      setStatus('idle');
      setProgress(0);
      setCurrentPage(0);
      setTotalCrawlPages(0);
      addLog('크롤링 중지됨');
    } catch (error) {
      addLog('중지 실패');
    }
  };

  const resetCrawler = async () => {
    try {
      await fetch('/api/admin/crawler/stop', { method: 'POST' });
      setStatus('idle');
      setProgress(0);
      setCurrentPage(0);
      setTotalCrawlPages(0);
      setCrawledData([]);
      addLog('크롤링 상태 초기화됨');
    } catch (error) {
      addLog('초기화 실패');
    }
  };

  const importData = async () => {
    if (crawledData.length === 0) {
      addLog('가져올 데이터가 없습니다');
      return;
    }

    setImporting(true);
    addLog(`데이터베이스에 ${crawledData.length}개 기관 저장 중...`);

    try {
      const response = await fetch('/api/admin/crawler/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ institutions: crawledData, jobId: currentJobId }),
      });

      if (!response.ok) throw new Error('데이터 가져오기 실패');

      const result = await response.json();
      addLog('✅ 데이터 가져오기 완료!');
      addLog(`  - 신규 생성: ${result.created}개`);
      addLog(`  - 업데이트: ${result.updated}개`);
      addLog(`  - 이력 기록: ${result.historyRecorded}개`);
      if (result.failed > 0) {
        addLog(`  - 실패: ${result.failed}개`);
      }
      addLog(`  - 총 처리: ${result.total}개`);

      setCrawledData([]);
      setStatus('idle');
      setCurrentJobId(null);
    } catch (error) {
      addLog(`❌ 가져오기 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setImporting(false);
    }
  };

  if (!crawler) {
    return <div className="text-center py-12">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            크롤러 관리로 돌아가기
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{crawler.name}</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">{crawler.url}</p>
        {crawler.description && (
          <p className="text-slate-500 dark:text-slate-500 mt-1">{crawler.description}</p>
        )}
      </div>

      {/* Control Panel */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">크롤러 설정</h2>

        {/* Max Pages */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            크롤링 페이지 수
            {totalPages !== null && (
              <span className="ml-2 text-blue-600 dark:text-blue-400 font-normal">
                (전체: {totalPages}페이지)
              </span>
            )}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              max={totalPages || 1000}
              value={maxPages}
              onChange={(e) => setMaxPages(parseInt(e.target.value) || 1)}
              disabled={status === 'running' || loadingTotalPages}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-slate-900 dark:text-white bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-500"
            />
            <Button
              onClick={fetchTotalPages}
              disabled={status === 'running' || loadingTotalPages}
              variant="outline"
            >
              {loadingTotalPages ? '조회 중...' : '전체 페이지 수 확인'}
            </Button>
          </div>
        </div>

        {/* Auto Save */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="autoSave"
            checked={autoSave}
            onChange={(e) => setAutoSave(e.target.checked)}
            disabled={status === 'running'}
            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 disabled:opacity-50"
          />
          <label htmlFor="autoSave" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            크롤링 완료 후 자동으로 DB에 저장
          </label>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={startCrawler}
            disabled={status === 'running'}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300"
          >
            {status === 'running' ? '크롤링 중...' : '크롤링 시작'}
          </Button>
          {status === 'running' && (
            <Button onClick={stopCrawler} variant="outline">
              중지
            </Button>
          )}
          {status === 'error' && (
            <Button onClick={resetCrawler} variant="outline" className="text-orange-600 border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20">
              상태 초기화
            </Button>
          )}
          {status === 'completed' && crawledData.length > 0 && (
            <Button
              onClick={importData}
              disabled={importing}
              className="bg-green-600 hover:bg-green-700 disabled:bg-slate-300"
            >
              {importing ? '저장 중...' : `데이터 가져오기 (${crawledData.length}개)`}
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        {status === 'running' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>진행률</span>
              <span className="font-semibold">
                {currentPage} / {totalCrawlPages} 페이지 ({progress}%)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">상태:</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              status === 'idle'
                ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                : status === 'running'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : status === 'completed'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {status === 'idle'
              ? '대기 중'
              : status === 'running'
                ? '실행 중'
                : status === 'completed'
                  ? '완료'
                  : '오류'}
          </span>
        </div>
      </div>

      {/* Data Preview */}
      {crawledData.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            수집된 데이터 미리보기 ({crawledData.length}개)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">기관코드</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">기관명</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">유형</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">주소</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300">정원</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300">현원</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {crawledData.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{item.institutionCode}</td>
                    <td className="px-4 py-3 text-slate-900 dark:text-slate-100 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.serviceType}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.address}</td>
                    <td className="px-4 py-3 text-right text-slate-900 dark:text-slate-100">{item.capacity}</td>
                    <td className="px-4 py-3 text-right text-slate-900 dark:text-slate-100">{item.currentHeadcount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Logs */}
      <div className="bg-slate-900 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">크롤링 로그</h2>
        <div className="bg-slate-950 rounded-md p-4 h-64 overflow-y-auto font-mono text-xs">
          {logs.length === 0 ? (
            <p className="text-slate-500">로그가 없습니다</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="text-green-400 mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
