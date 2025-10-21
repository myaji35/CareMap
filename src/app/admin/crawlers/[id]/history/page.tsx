'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type Crawler = {
  id: string;
  name: string;
  url: string;
  description: string | null;
  jobs: any[];
};

export default function CrawlerHistoryPage() {
  const params = useParams();
  const crawlerId = params?.id as string;

  const [crawler, setCrawler] = useState<Crawler | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!crawlerId) return;

    fetch(`/api/admin/crawlers/${crawlerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.crawler) {
          setCrawler(data.crawler);
        }
      })
      .catch((error) => {
        console.error('크롤러 로드 오류:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [crawlerId]);

  if (loading) {
    return <div className="text-center py-12">로딩 중...</div>;
  }

  if (!crawler) {
    return <div className="text-center py-12 text-red-600">크롤러를 찾을 수 없습니다</div>;
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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{crawler.name} - 작업 이력</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">{crawler.url}</p>
      </div>

      {/* Job History */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          크롤링 작업 이력 (총 {crawler.jobs.length}회)
        </h2>
        {crawler.jobs.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-8">작업 이력이 없습니다</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">상태</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">시작 시간</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">완료 시간</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300">총 페이지</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300">수집 개수</th>
                  <th className="px-4 py-3 text-center font-medium text-slate-700 dark:text-slate-300">DB 저장</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300">신규</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300">업데이트</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300">실패</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {crawler.jobs.map((job) => {
                  const duration = job.completedAt
                    ? Math.round((new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime()) / 1000)
                    : null;

                  return (
                    <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          job.status === 'running'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : job.status === 'completed'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {job.status === 'running' ? '실행 중' : job.status === 'completed' ? '완료' : '실패'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {new Date(job.startedAt).toLocaleString('ko-KR')}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {job.completedAt ? (
                          <span>
                            {new Date(job.completedAt).toLocaleString('ko-KR')}
                            {duration && <span className="text-xs text-slate-400 ml-1">({duration}초)</span>}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-900 dark:text-slate-100">{job.totalPages}</td>
                      <td className="px-4 py-3 text-right text-slate-900 dark:text-slate-100 font-medium">{job.crawledCount}</td>
                      <td className="px-4 py-3 text-center">
                        {job.savedToDb ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">{job.createdCount || 0}</td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">{job.updatedCount || 0}</td>
                      <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">
                        {job.failedCount > 0 ? (
                          <span className="text-red-600 font-medium">{job.failedCount}</span>
                        ) : (
                          <span>0</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
