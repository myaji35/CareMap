'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, MapPin, Database, CheckCircle, AlertCircle } from 'lucide-react';

interface DatabaseStatus {
  totalInstitutions: number;
  institutionsWithCoordinates: number;
  institutionsWithoutCoordinates: number;
  coordinateCompletionRate: number;
  recentInstitutions: Array<{
    id: string;
    institutionCode: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    createdAt: string;
  }>;
  institutionsNeedingCoordinates: Array<{
    id: string;
    institutionCode: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  }>;
}

interface UpdateResult {
  status: string;
  updated: number;
  failed: number;
  total: number;
  errors?: string[];
  message: string;
}

export default function DatabaseManagementPage() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updateResult, setUpdateResult] = useState<UpdateResult | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/database/status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('상태 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCoordinates = async (limit: number = 50) => {
    if (!confirm(`최대 ${limit}개 기관의 좌표를 업데이트하시겠습니까?`)) {
      return;
    }

    setUpdating(true);
    setUpdateResult(null);

    try {
      const response = await fetch('/api/admin/coordinates/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ limit }),
      });

      const data = await response.json();
      setUpdateResult(data);

      // 업데이트 후 상태 새로고침
      await fetchStatus();
    } catch (error) {
      console.error('좌표 업데이트 실패:', error);
      setUpdateResult({
        status: 'error',
        updated: 0,
        failed: 0,
        total: 0,
        message: '좌표 업데이트에 실패했습니다',
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          데이터베이스 관리
        </h1>
        <p className="text-red-600 dark:text-red-400">데이터를 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">데이터베이스 관리</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            크롤링된 데이터 상태 확인 및 좌표 업데이트
          </p>
        </div>
        <Button onClick={fetchStatus} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 총 기관 수 */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">총 기관 수</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                {status.totalInstitutions.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* 좌표 설정 완료 */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">좌표 설정 완료</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {status.institutionsWithCoordinates.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {status.coordinateCompletionRate.toFixed(1)}% 완료
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* 좌표 미설정 */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">좌표 미설정</p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">
                {status.institutionsWithoutCoordinates.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 좌표 업데이트 섹션 */}
      {status.institutionsWithoutCoordinates > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">좌표 일괄 업데이트</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Kakao Geocoding API를 사용하여 주소를 좌표로 변환합니다
              </p>
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <Button
              onClick={() => handleUpdateCoordinates(50)}
              disabled={updating}
              className="flex-1"
            >
              <MapPin className={`h-4 w-4 mr-2 ${updating ? 'animate-pulse' : ''}`} />
              {updating ? '업데이트 중...' : '50개 업데이트'}
            </Button>
            <Button
              onClick={() => handleUpdateCoordinates(100)}
              disabled={updating}
              variant="outline"
              className="flex-1"
            >
              <MapPin className={`h-4 w-4 mr-2 ${updating ? 'animate-pulse' : ''}`} />
              {updating ? '업데이트 중...' : '100개 업데이트'}
            </Button>
            <Button
              onClick={() => handleUpdateCoordinates(status.institutionsWithoutCoordinates)}
              disabled={updating}
              variant="outline"
              className="flex-1"
            >
              <MapPin className={`h-4 w-4 mr-2 ${updating ? 'animate-pulse' : ''}`} />
              {updating ? '업데이트 중...' : '전체 업데이트'}
            </Button>
          </div>

          {/* 업데이트 결과 */}
          {updateResult && (
            <div className={`p-4 rounded-lg ${
              updateResult.status === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <p className={`font-semibold ${
                updateResult.status === 'success'
                  ? 'text-green-900 dark:text-green-100'
                  : 'text-red-900 dark:text-red-100'
              }`}>
                {updateResult.message}
              </p>
              <div className="mt-2 text-sm space-y-1">
                <p className="text-slate-700 dark:text-slate-300">
                  성공: {updateResult.updated}개 | 실패: {updateResult.failed}개 | 총: {updateResult.total}개
                </p>
                {updateResult.errors && updateResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-slate-700 dark:text-slate-300">오류 목록:</p>
                    <ul className="list-disc list-inside text-slate-600 dark:text-slate-400">
                      {updateResult.errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 좌표 미설정 기관 목록 */}
      {status.institutionsNeedingCoordinates.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            좌표가 필요한 기관 (최대 20개)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">
                    기관코드
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">
                    기관명
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">
                    주소
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-slate-700 dark:text-slate-300">
                    상태
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-700">
                {status.institutionsNeedingCoordinates.map((institution) => (
                  <tr key={institution.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                    <td className="px-4 py-3 text-slate-900 dark:text-slate-100 font-mono text-xs">
                      {institution.institutionCode}
                    </td>
                    <td className="px-4 py-3 text-slate-900 dark:text-slate-100">
                      {institution.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {institution.address}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">
                        좌표 없음
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 최근 추가된 기관 */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          최근 추가된 기관
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">
                  기관코드
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">
                  기관명
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300">
                  주소
                </th>
                <th className="px-4 py-3 text-center font-medium text-slate-700 dark:text-slate-300">
                  좌표
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300">
                  추가일
                </th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-700">
              {status.recentInstitutions.map((institution) => {
                const hasCoordinates = institution.latitude !== 0 && institution.longitude !== 0;
                return (
                  <tr key={institution.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                    <td className="px-4 py-3 text-slate-900 dark:text-slate-100 font-mono text-xs">
                      {institution.institutionCode}
                    </td>
                    <td className="px-4 py-3 text-slate-900 dark:text-slate-100">
                      {institution.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {institution.address}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        hasCoordinates
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200'
                      }`}>
                        {hasCoordinates ? '✓ 설정됨' : '✗ 미설정'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">
                      {new Date(institution.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
