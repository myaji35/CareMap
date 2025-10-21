import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* 네비게이션 바 */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-slate-900">CareMap</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                대시보드 이동
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-slate-900 mb-6">
            장기요양기관 데이터의
            <br />
            <span className="text-blue-600">새로운 기준</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            전국 장기요양기관의 데이터를 수집, 분석하여
            <br />
            직관적인 지도와 차트로 제공하는 데이터 플랫폼
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/dashboard/map-view"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
            >
              지도 뷰 체험하기
            </Link>
            <a
              href="#features"
              className="px-8 py-3 bg-white text-slate-900 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors font-medium text-lg"
            >
              더 알아보기
            </a>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="text-blue-600 font-bold text-3xl mb-2">실시간</div>
            <div className="text-slate-600">데이터 시각화</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="text-blue-600 font-bold text-3xl mb-2">월별</div>
            <div className="text-slate-600">변동 이력 추적</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="text-blue-600 font-bold text-3xl mb-2">전국</div>
            <div className="text-slate-600">요양기관 현황</div>
          </div>
        </div>
      </section>

      {/* 기능 섹션 */}
      <section id="features" className="bg-white py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              핵심 기능
            </h2>
            <p className="text-lg text-slate-600">
              데이터의 흐름을 시각화하여 깊은 통찰력을 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 기능 1: 지도 시각화 */}
            <div className="p-8 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                지도 기반 시각화
              </h3>
              <p className="text-slate-600">
                전국 요양기관을 지도 위에 표시하고, 정원 대비 현원 비율을 파이
                차트 마커로 직관적으로 확인할 수 있습니다.
              </p>
            </div>

            {/* 기능 2: 시계열 분석 */}
            <div className="p-8 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                시계열 데이터 분석
              </h3>
              <p className="text-slate-600">
                월별 정원, 현원, 입소율 변화를 차트로 추적하여 기관의 운영
                안정성과 추세를 파악할 수 있습니다.
              </p>
            </div>

            {/* 기능 3: 이력 관리 */}
            <div className="p-8 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                변동 이력 추적
              </h3>
              <p className="text-slate-600">
                기관의 이름, 주소, 정원, 현원 변경 사항을 모두 기록하여 데이터의
                신뢰성과 투명성을 확보합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            데이터 기반 의사결정으로 더 나은 요양 서비스를 제공하세요
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-lg"
          >
            대시보드 시작하기
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-white font-bold text-xl">CareMap</h3>
              <p className="text-slate-400 text-sm mt-1">
                장기요양기관 데이터 플랫폼
              </p>
            </div>
            <div className="text-slate-400 text-sm">
              © 2025 CareMap. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
