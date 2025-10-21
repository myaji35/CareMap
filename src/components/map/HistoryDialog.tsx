'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface InstitutionHistory {
  id: string;
  institutionId: string;
  recordedDate: string;
  name: string;
  address: string;
  capacity: number;
  currentHeadcount: number;
}

interface HistoryDialogProps {
  institutionId: string;
  institutionName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HistoryDialog({
  institutionId,
  institutionName,
  open,
  onOpenChange,
}: HistoryDialogProps) {
  const [history, setHistory] = useState<InstitutionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && institutionId) {
      fetchHistory();
    }
  }, [open, institutionId]);

  async function fetchHistory() {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/institutions/${institutionId}/history`);
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Recharts를 위한 데이터 변환
  const chartData = history.map((record) => ({
    date: new Date(record.recordedDate).toLocaleDateString('ko-KR', {
      year: '2-digit',
      month: 'numeric',
    }),
    정원: record.capacity,
    현원: record.currentHeadcount,
    입소율: ((record.currentHeadcount / record.capacity) * 100).toFixed(1),
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{institutionName} - 변동 이력</DialogTitle>
          <DialogDescription>
            시간에 따른 정원, 현원 변화 추이를 확인할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-slate-500">데이터를 불러오는 중...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-slate-500">이력 데이터가 없습니다.</p>
            </div>
          ) : (
            <>
              {/* 라인 차트 */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  정원 및 현원 추이
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      stroke="#64748b"
                    />
                    <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="정원"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="현원"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* 입소율 차트 */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  입소율 변화
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      stroke="#64748b"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="#64748b"
                      domain={[0, 150]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                      formatter={(value: any) => [`${value}%`, '입소율']}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="입소율"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* 데이터 테이블 */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  상세 이력
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-slate-700">
                          기록일
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-slate-700">
                          기관명
                        </th>
                        <th className="px-4 py-3 text-right font-medium text-slate-700">
                          정원
                        </th>
                        <th className="px-4 py-3 text-right font-medium text-slate-700">
                          현원
                        </th>
                        <th className="px-4 py-3 text-right font-medium text-slate-700">
                          입소율
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {history.map((record) => {
                        const occupancyRate = (
                          (record.currentHeadcount / record.capacity) *
                          100
                        ).toFixed(1);
                        const isOvercapacity =
                          record.currentHeadcount > record.capacity;

                        return (
                          <tr key={record.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-slate-900">
                              {new Date(record.recordedDate).toLocaleDateString(
                                'ko-KR'
                              )}
                            </td>
                            <td className="px-4 py-3 text-slate-900">
                              {record.name}
                            </td>
                            <td className="px-4 py-3 text-right text-slate-900">
                              {record.capacity}명
                            </td>
                            <td
                              className={`px-4 py-3 text-right font-medium ${
                                isOvercapacity ? 'text-red-600' : 'text-slate-900'
                              }`}
                            >
                              {record.currentHeadcount}명
                            </td>
                            <td
                              className={`px-4 py-3 text-right font-bold ${
                                isOvercapacity ? 'text-red-600' : 'text-blue-600'
                              }`}
                            >
                              {occupancyRate}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
