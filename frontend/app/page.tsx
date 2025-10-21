'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                CareMap
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-2 text-gray-700 hover:text-blue-600 font-medium transition"
              >
                로그인
              </button>
              <button
                onClick={() => router.push('/register')}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition transform hover:scale-105"
              >
                시작하기
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              전국 장기요양기관
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                한눈에 확인하세요
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              실시간 입소율 정보와 지도 기반 시각화로
              <br />
              가족을 위한 최적의 요양기관을 찾아보세요
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => router.push('/register')}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-xl font-semibold transition transform hover:scale-105 shadow-lg"
              >
                무료로 시작하기
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 text-lg rounded-xl font-semibold transition border-2 border-gray-200 hover:border-blue-600"
              >
                지도 둘러보기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">주요 기능</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">지도 기반 검색</h3>
              <p className="text-gray-600">
                Kakao Maps를 활용한 직관적인 지도 인터페이스로 주변 요양기관을 쉽게 찾아보세요
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">실시간 입소율</h3>
              <p className="text-gray-600">
                색상으로 구분된 입소율 정보와 월별 추이 차트로 기관 현황을 한눈에 파악하세요
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">자동 데이터 수집</h3>
              <p className="text-gray-600">
                주기적인 크롤링으로 항상 최신 정보를 제공하며, 변경 이력을 추적합니다
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-blue-600 mb-2">1,000+</div>
              <div className="text-gray-600 font-medium">등록된 요양기관</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-gray-600 font-medium">실시간 업데이트</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-purple-600 mb-2">100%</div>
              <div className="text-gray-600 font-medium">무료 서비스</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            회원가입은 무료이며, 모든 기능을 제한 없이 사용할 수 있습니다
          </p>
          <button
            onClick={() => router.push('/register')}
            className="px-10 py-4 bg-white hover:bg-gray-100 text-blue-600 text-lg rounded-xl font-bold transition transform hover:scale-105 shadow-xl"
          >
            무료 회원가입
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-white mb-4">CareMap</h3>
          <p className="mb-4">전국 장기요양기관 정보 플랫폼</p>
          <p className="text-sm">© 2025 CareMap. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
