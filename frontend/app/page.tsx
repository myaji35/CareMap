'use client';

import { KakaoMap } from '@/components/KakaoMap';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import type { Institution } from '@/types/institution';

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch institutions from API
  useEffect(() => {
    async function fetchInstitutions() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/institutions');

        if (!response.ok) {
          throw new Error('기관 목록을 불러오는데 실패했습니다.');
        }

        const data = await response.json();
        setInstitutions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        console.error('Error fetching institutions:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInstitutions();
  }, []);

  const handleMarkerClick = (id: number) => {
    console.log('Institution clicked:', id);
    // 나중에 상세 페이지로 이동
    // router.push(`/institutions/${id}`);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <main className="w-full h-screen relative">
      {/* 상단 헤더 */}
      <div className="absolute top-0 left-0 right-0 bg-white shadow-md z-20 px-6 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">CareMap</h1>

        <div className="flex items-center gap-4">
          {status === 'loading' ? (
            <div className="text-sm text-gray-500">로딩 중...</div>
          ) : session?.user ? (
            <>
              {/* 관리자 전용 메뉴 */}
              {session.user.userType === 'ADMIN' && (
                <button
                  onClick={() => router.push('/crawler')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition"
                >
                  데이터 크롤링
                </button>
              )}
              <div className="text-sm">
                <span className="text-gray-600">환영합니다, </span>
                <span className="font-semibold text-blue-600">{session.user.name}</span>
                <span className="text-xs text-gray-500 ml-2">
                  ({session.user.userType === 'ADMIN' ? '관리자' : session.user.userType === 'MANAGER' ? '매니저' : '사용자'})
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition"
              >
                로그아웃
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
            >
              로그인
            </button>
          )}
        </div>
      </div>

      {/* 지도 */}
      <div className="w-full h-full pt-16">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">기관 정보를 불러오는 중...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-red-600">
              <p className="text-lg font-semibold mb-2">오류 발생</p>
              <p>{error}</p>
            </div>
          </div>
        ) : institutions.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-lg font-semibold mb-2">등록된 기관이 없습니다</p>
              <p className="text-sm">관리자에게 문의하세요.</p>
            </div>
          </div>
        ) : (
          <KakaoMap
            institutions={institutions}
            onMarkerClick={handleMarkerClick}
          />
        )}
      </div>
    </main>
  );
}