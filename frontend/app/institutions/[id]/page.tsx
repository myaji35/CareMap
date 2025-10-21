'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Institution {
  id: number;
  institutionCode: string;
  name: string;
  serviceType: string | null;
  capacity: number | null;
  currentHeadcount: number | null;
  address: string | null;
  operatingHours: string | null;
  latitude: number | null;
  longitude: number | null;
  lastUpdatedAt: string;
  occupancyRate: number;
  history: InstitutionHistory[];
}

interface InstitutionHistory {
  id: number;
  recordedDate: string;
  name: string | null;
  address: string | null;
  capacity: number | null;
  currentHeadcount: number | null;
}

export default function InstitutionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInstitution() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/institutions/${id}`);

        if (!response.ok) {
          throw new Error('기관 정보를 불러오는데 실패했습니다.');
        }

        const data = await response.json();
        setInstitution(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        console.error('Error fetching institution:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchInstitution();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">기관 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !institution) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg font-semibold mb-4">
            {error || '기관을 찾을 수 없습니다.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = institution.history.map((h) => ({
    date: new Date(h.recordedDate).toLocaleDateString('ko-KR', { month: 'short', year: '2-digit' }),
    입소율: h.capacity && h.currentHeadcount ? Math.round((h.currentHeadcount / h.capacity) * 100) : 0,
    정원: h.capacity || 0,
    현원: h.currentHeadcount || 0,
  })).reverse();

  // Occupancy rate color
  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600 bg-red-50';
    if (rate >= 70) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const getOccupancyBorderColor = (rate: number) => {
    if (rate >= 90) return 'border-red-500';
    if (rate >= 70) return 'border-orange-500';
    return 'border-green-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              목록으로
            </button>
            <h1 className="text-xl font-bold text-gray-900">기관 상세 정보</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Info Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{institution.name}</h2>
              <p className="text-gray-600">{institution.serviceType || '서비스 유형 미등록'}</p>
            </div>
            <div className={`px-6 py-3 rounded-lg ${getOccupancyColor(institution.occupancyRate)} border-2 ${getOccupancyBorderColor(institution.occupancyRate)}`}>
              <div className="text-sm font-medium mb-1">입소율</div>
              <div className="text-3xl font-bold">{institution.occupancyRate}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-gray-400 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="text-sm text-gray-500">주소</p>
                <p className="text-gray-900">{institution.address || '주소 정보 없음'}</p>
              </div>
            </div>

            <div className="flex items-start">
              <svg className="w-5 h-5 text-gray-400 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-gray-500">운영시간</p>
                <p className="text-gray-900">{institution.operatingHours || '운영시간 정보 없음'}</p>
              </div>
            </div>

            <div className="flex items-start">
              <svg className="w-5 h-5 text-gray-400 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div>
                <p className="text-sm text-gray-500">정원 / 현원</p>
                <p className="text-gray-900">
                  <span className="font-semibold">{institution.capacity || 0}</span>명 /
                  <span className="font-semibold ml-1">{institution.currentHeadcount || 0}</span>명
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <svg className="w-5 h-5 text-gray-400 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <div>
                <p className="text-sm text-gray-500">기관 코드</p>
                <p className="text-gray-900 font-mono">{institution.institutionCode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">월별 입소율 추이</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="입소율" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* History Table */}
        {institution.history.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">변경 이력</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      기록 날짜
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      정원
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      현원
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      입소율
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {institution.history.map((record) => {
                    const rate = record.capacity && record.currentHeadcount
                      ? Math.round((record.currentHeadcount / record.capacity) * 100)
                      : 0;
                    return (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(record.recordedDate).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.capacity || '-'}명
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.currentHeadcount || '-'}명
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full ${getOccupancyColor(rate)}`}>
                            {rate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {institution.history.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-center text-gray-500">변경 이력이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
