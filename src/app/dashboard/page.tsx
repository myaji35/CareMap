'use client';

import { useEffect, useState } from 'react';
import { Building2, History, TrendingUp, Calendar, Users, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DashboardStats {
  totalInstitutions: number;
  totalHistoryRecords: number;
  recentChanges: number;
  lastCrawlerJob: {
    completedAt: string;
    crawledCount: number;
    createdCount: number;
    updatedCount: number;
  } | null;
  serviceTypeStats: Array<{
    serviceType: string;
    count: number;
  }>;
  capacityStats: {
    totalCapacity: number;
    totalCurrentHeadcount: number;
    occupancyRate: number;
    overCapacityCount: number;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('통계 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">대시보드</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            통계를 불러오는데 실패했습니다.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">대시보드</h1>
        <p className="text-slate-600 dark:text-slate-400">
          전국 장기요양기관 현황을 한눈에 확인하세요
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 총 기관 수 */}
        <Link href="/dashboard/map-view">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">총 기관 수</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    {stats.totalInstitutions.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* 총 이력 기록 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">총 이력 기록</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {stats.totalHistoryRecords.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <History className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 최근 30일 변경 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">최근 30일 변경</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {stats.recentChanges.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 입소율 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">전체 입소율</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {stats.capacityStats.occupancyRate.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Users className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 정원/현원 상세 */}
        <Card>
          <CardHeader>
            <CardTitle>정원 현황</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">총 정원</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {stats.capacityStats.totalCapacity.toLocaleString()}명
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">총 현원</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {stats.capacityStats.totalCurrentHeadcount.toLocaleString()}명
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                정원 초과 기관
              </span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                {stats.capacityStats.overCapacityCount.toLocaleString()}개
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 마지막 크롤링 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>마지막 크롤링</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.lastCrawlerJob ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    완료 시간
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {new Date(stats.lastCrawlerJob.completedAt).toLocaleString('ko-KR')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">수집 개수</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {stats.lastCrawlerJob.crawledCount.toLocaleString()}개
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">신규 생성</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {stats.lastCrawlerJob.createdCount.toLocaleString()}개
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">업데이트</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {stats.lastCrawlerJob.updatedCount.toLocaleString()}개
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-slate-600 dark:text-slate-400">크롤링 기록이 없습니다.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Service Type Stats */}
      <Card>
        <CardHeader>
          <CardTitle>서비스 유형별 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {stats.serviceTypeStats.map((stat) => (
              <div key={stat.serviceType} className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{stat.serviceType}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stat.count.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
