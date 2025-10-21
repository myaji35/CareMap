'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: '대시보드', href: '/dashboard' },
  { name: '지도 뷰', href: '/dashboard/map-view' },
  { name: '이력 분석', href: '/dashboard/analytics' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* 모바일 햄버거 버튼 */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white border shadow-sm lg:hidden hover:bg-slate-50"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <svg
            className="w-6 h-6 text-slate-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6 text-slate-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {/* 모바일 오버레이 */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* 사이드바 */}
      <div
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 flex h-screen w-64 flex-col border-r bg-slate-50 transition-transform duration-300 lg:translate-x-0',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo/Project Name */}
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-2xl font-bold text-slate-900">CareMap</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} onClick={closeMobileMenu}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    isActive
                      ? 'bg-slate-900 text-white hover:bg-slate-800'
                      : 'text-slate-700 hover:bg-slate-100'
                  )}
                >
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t p-4">
          <p className="text-xs text-slate-500 text-center">
            © 2025 CareMap
          </p>
        </div>
      </div>
    </>
  );
}
