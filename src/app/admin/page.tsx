'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Play, Edit, Trash2, History, RefreshCw, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

type CrawlerJob = {
  id: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt: string | null;
  totalPages: number;
  crawledCount: number;
  createdCount: number | null;
  updatedCount: number | null;
  failedCount: number | null;
  savedToDb: boolean;
};

type Crawler = {
  id: string;
  name: string;
  url: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  jobs: CrawlerJob[];
  _count: {
    jobs: number;
  };
};

type PreparationDialog = {
  crawlerId: string;
  totalPages: number | null;
  loading: boolean;
  error: string | null;
};

export default function CrawlerManagementPage() {
  const [crawlers, setCrawlers] = useState<Crawler[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCrawler, setEditingCrawler] = useState<Crawler | null>(null);
  const [preparationDialog, setPreparationDialog] = useState<PreparationDialog | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
  });

  const pollingIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // 크롤러 목록 로드
  const loadCrawlers = async () => {
    try {
      const response = await fetch('/api/admin/crawlers');
      const data = await response.json();
      setCrawlers(data.crawlers || []);
    } catch (error) {
      console.error('크롤러 목록 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCrawlers();

    // 실행 중인 작업 폴링 시작
    const interval = setInterval(loadCrawlers, 3000);

    return () => {
      clearInterval(interval);
      // 모든 폴링 정리
      pollingIntervalsRef.current.forEach(interval => clearInterval(interval));
    };
  }, []);

  // 크롤러 추가
  const handleAdd = async () => {
    if (!formData.name || !formData.url) {
      toast.error('이름과 URL은 필수 항목입니다');
      return;
    }

    try {
      const response = await fetch('/api/admin/crawlers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setShowAddDialog(false);
        setFormData({ name: '', url: '', description: '' });
        loadCrawlers();
        toast.success('크롤러가 성공적으로 등록되었습니다!');
      } else {
        toast.error(`크롤러 등록 실패: ${data.error}`);
      }
    } catch (error) {
      console.error('크롤러 등록 오류:', error);
      toast.error(`크롤러 등록 중 오류가 발생했습니다`);
    }
  };

  // 크롤러 수정
  const handleEdit = async () => {
    if (!editingCrawler) return;

    try {
      const response = await fetch(`/api/admin/crawlers/${editingCrawler.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setEditingCrawler(null);
        setFormData({ name: '', url: '', description: '' });
        loadCrawlers();
        toast.success('크롤러가 수정되었습니다');
      } else {
        toast.error('크롤러 수정에 실패했습니다');
      }
    } catch (error) {
      toast.error('크롤러 수정 중 오류가 발생했습니다');
    }
  };

  // 크롤러 삭제
  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 크롤러를 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/crawlers/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadCrawlers();
        toast.success('크롤러가 삭제되었습니다');
      } else {
        toast.error('크롤러 삭제에 실패했습니다');
      }
    } catch (error) {
      toast.error('크롤러 삭제 중 오류가 발생했습니다');
    }
  };

  // 활성화/비활성화 토글
  const toggleActive = async (crawler: Crawler) => {
    try {
      const response = await fetch(`/api/admin/crawlers/${crawler.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !crawler.isActive }),
      });

      if (response.ok) {
        loadCrawlers();
        toast.success(crawler.isActive ? '크롤러가 비활성화되었습니다' : '크롤러가 활성화되었습니다');
      }
    } catch (error) {
      toast.error('상태 변경에 실패했습니다');
    }
  };

  // 준비 프로세스 시작
  const startPreparation = async (crawlerId: string) => {
    setPreparationDialog({
      crawlerId,
      totalPages: null,
      loading: true,
      error: null,
    });

    try {
      const response = await fetch('/api/admin/crawler/total-pages');
      const data = await response.json();

      if (response.ok && data.totalPages) {
        setPreparationDialog(prev => prev ? {
          ...prev,
          totalPages: data.totalPages,
          loading: false,
        } : null);
      } else {
        setPreparationDialog(prev => prev ? {
          ...prev,
          loading: false,
          error: data.error || '전체 페이지 수를 가져오는데 실패했습니다',
        } : null);
      }
    } catch (error) {
      console.error('전체 페이지 수 조회 오류:', error);
      setPreparationDialog(prev => prev ? {
        ...prev,
        loading: false,
        error: '전체 페이지 수를 가져오는데 실패했습니다',
      } : null);
    }
  };

  // 크롤링 실행
  const startCrawling = async () => {
    if (!preparationDialog?.totalPages) return;

    const { totalPages } = preparationDialog;

    try {
      const response = await fetch('/api/admin/crawler/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalPages }),
      });

      const data = await response.json();

      if (response.ok) {
        // 다이얼로그 닫기
        setPreparationDialog(null);

        // 크롤러 목록 새로고침
        loadCrawlers();

        toast.success(`크롤링이 백그라운드에서 시작되었습니다!`, {
          description: `총 ${totalPages}개 페이지를 크롤링합니다.`
        });
      } else {
        toast.error(`크롤링 시작 실패: ${data.error}`);
      }
    } catch (error) {
      console.error('크롤링 시작 오류:', error);
      toast.error('크롤링 시작 중 오류가 발생했습니다');
    }
  };

  const openEditDialog = (crawler: Crawler) => {
    setEditingCrawler(crawler);
    setFormData({
      name: crawler.name,
      url: crawler.url,
      description: crawler.description || '',
    });
  };

  const getProgressPercentage = (job: CrawlerJob): number => {
    if (job.totalPages === 0) return 0;
    return Math.round((job.crawledCount / job.totalPages) * 100);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">크롤러 관리</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            크롤러를 등록하고 관리합니다
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={loadCrawlers}
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            새 크롤러 추가
          </Button>
        </div>
      </div>

      {/* Crawler List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            로딩 중...
          </div>
        ) : crawlers.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12 text-center">
            <p className="text-slate-500 dark:text-slate-400 mb-4">등록된 크롤러가 없습니다</p>
            <Button
              onClick={() => setShowAddDialog(true)}
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              첫 크롤러 추가하기
            </Button>
          </div>
        ) : (
          crawlers.map((crawler) => {
            const lastJob = crawler.jobs[0];
            const isRunning = lastJob?.status === 'running';
            const progress = lastJob ? getProgressPercentage(lastJob) : 0;

            return (
              <Card key={crawler.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {crawler.name}
                        </h3>
                        <Badge
                          variant={crawler.isActive ? 'default' : 'secondary'}
                          className="cursor-pointer"
                          onClick={() => toggleActive(crawler)}
                        >
                          {crawler.isActive ? '활성' : '비활성'}
                        </Badge>
                      </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 break-all">
                      {crawler.url}
                    </p>
                    {crawler.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-500 mb-3">
                        {crawler.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={!crawler.isActive || isRunning}
                      onClick={() => startPreparation(crawler.id)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      실행
                    </Button>
                    <Link href={`/admin/crawlers/${crawler.id}/history`}>
                      <Button size="sm" variant="outline">
                        <History className="h-4 w-4 mr-1" />
                        이력
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(crawler)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(crawler.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 작업 상태 및 진행률 */}
                {lastJob && (
                  <div className="space-y-3 pt-4 border-t dark:border-slate-700">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {lastJob.status === 'running' && (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        )}
                        {lastJob.status === 'completed' && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {lastJob.status === 'failed' && (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <Badge variant={
                          lastJob.status === 'running' ? 'default' :
                          lastJob.status === 'completed' ? 'outline' :
                          'destructive'
                        }>
                          {lastJob.status === 'running' ? '실행 중' :
                           lastJob.status === 'completed' ? '완료' : '실패'}
                        </Badge>
                      </div>
                      <span className="text-slate-600 dark:text-slate-400">
                        {new Date(lastJob.startedAt).toLocaleString('ko-KR')}
                      </span>
                    </div>

                    {/* 진행률 바 */}
                    {lastJob.status === 'running' && (
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                          <span>{lastJob.crawledCount} / {lastJob.totalPages} 페이지</span>
                          <span className="font-semibold">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}

                    {/* 결과 */}
                    {lastJob.status === 'completed' && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
                          <p className="text-xs text-slate-600 dark:text-slate-400">수집</p>
                          <p className="text-lg font-bold text-slate-900 dark:text-white">
                            {lastJob.crawledCount}개
                          </p>
                        </div>
                        {lastJob.savedToDb && (
                          <>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                              <p className="text-xs text-green-600 dark:text-green-400">신규</p>
                              <p className="text-lg font-bold text-green-900 dark:text-green-100">
                                {lastJob.createdCount || 0}개
                              </p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                              <p className="text-xs text-blue-600 dark:text-blue-400">업데이트</p>
                              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                {lastJob.updatedCount || 0}개
                              </p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                              <p className="text-xs text-red-600 dark:text-red-400">실패</p>
                              <p className="text-lg font-bold text-red-900 dark:text-red-100">
                                {lastJob.failedCount || 0}개
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                      <span>총 {crawler._count.jobs}회 실행</span>
                      {lastJob.savedToDb && (
                        <>
                          <span>•</span>
                          <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-600">
                            DB 저장 완료
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Preparation Dialog */}
      {preparationDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              크롤링 준비
            </h2>

            {preparationDialog.loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  전체 페이지 수를 확인하고 있습니다...
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                  약 10-20초 소요됩니다
                </p>
              </div>
            ) : preparationDialog.error ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <p className="text-red-600 dark:text-red-400 mb-4">
                  {preparationDialog.error}
                </p>
                <Button
                  variant="outline"
                  onClick={() => setPreparationDialog(null)}
                >
                  닫기
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  전체 {preparationDialog.totalPages}페이지
                </p>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  준비되었습니다!
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">
                  OK 버튼을 누르면 백그라운드에서 크롤링이 시작됩니다.
                  <br />
                  진행 상황은 이 페이지에서 확인할 수 있습니다.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setPreparationDialog(null)}
                  >
                    취소
                  </Button>
                  <Button
                    onClick={startCrawling}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    OK - 시작
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      {(showAddDialog || editingCrawler) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              {editingCrawler ? '크롤러 수정' : '새 크롤러 추가'}
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  이름 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="예: 장기요양기관 목록"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">
                  URL <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="url"
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">
                  설명
                </Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={3}
                  placeholder="크롤러에 대한 설명을 입력하세요"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setEditingCrawler(null);
                  setFormData({ name: '', url: '', description: '' });
                }}
              >
                취소
              </Button>
              <Button
                onClick={editingCrawler ? handleEdit : handleAdd}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editingCrawler ? '수정' : '추가'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
