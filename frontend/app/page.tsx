'use client';

import { KakaoMap } from '@/components/KakaoMap';
import { mockInstitutions } from '@/lib/mockData';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleMarkerClick = (id: number) => {
    console.log('Institution clicked:', id);
    // 나중에 상세 페이지로 이동
    // router.push(`/institution/${id}`);
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
        <KakaoMap
          institutions={mockInstitutions}
          onMarkerClick={handleMarkerClick}
        />
      </div>
    </main>
  );
}