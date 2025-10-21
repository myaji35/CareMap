'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Map,
  TrendingUp,
  Settings,
  Database,
  User,
  ChevronDown,
  ChevronUp,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

const navigation = [
  { name: '대시보드', href: '/dashboard', icon: LayoutDashboard },
  { name: '지도 뷰', href: '/dashboard/map-view', icon: Map },
  { name: '이력 분석', href: '/dashboard/analytics', icon: TrendingUp },
];

const adminNavigation = [
  { name: '크롤러 관리', href: '/admin', icon: Database },
  { name: 'DB 관리', href: '/admin/database', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
          'fixed lg:static inset-y-0 left-0 z-40 flex h-screen flex-col border-r bg-slate-50 dark:bg-slate-900 dark:border-slate-800 transition-all duration-300 lg:translate-x-0',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo/Project Name */}
        <div className="flex h-16 items-center justify-between border-b dark:border-slate-800 px-4">
          {!isCollapsed && (
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              CareMap
            </h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto hover:bg-slate-200 dark:hover:bg-slate-800"
            title={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 py-2">
                <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  메인 메뉴
                </h2>
              </div>
            )}
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href} onClick={closeMobileMenu}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      'w-full gap-3',
                      isCollapsed ? 'justify-center px-0' : 'justify-start',
                      isActive
                        ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Button>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 space-y-1">
            {!isCollapsed && (
              <div className="px-3 py-2">
                <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  관리
                </h2>
              </div>
            )}
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href} onClick={closeMobileMenu}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      'w-full gap-3',
                      isCollapsed ? 'justify-center px-0' : 'justify-start',
                      isActive
                        ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Button>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Settings Section */}
        <div className="border-t dark:border-slate-800">
          {!isCollapsed ? (
            <>
              {/* User Menu Toggle Button */}
              <Button
                variant="ghost"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-full justify-start gap-3 rounded-none text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">사용자</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">관리자</p>
                  </div>
                </div>
                {isUserMenuOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="border-t dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50">
                  {/* Settings Link */}
                  <Link href="/dashboard/settings" onClick={closeMobileMenu}>
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-start gap-3 rounded-none',
                        pathname === '/dashboard/settings'
                          ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-700'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      )}
                    >
                      <Settings className="h-4 w-4 ml-11" />
                      <span className="text-sm">설정</span>
                    </Button>
                  </Link>

                  {/* Theme Toggle */}
                  <div className="px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-11">테마</span>
                    <ThemeToggle />
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Collapsed User Icon */}
              <Link href="/dashboard/settings" onClick={closeMobileMenu}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'w-full rounded-none',
                    pathname === '/dashboard/settings'
                      ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-700'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                  title="설정"
                >
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </>
          )}

          {/* Footer */}
          {!isCollapsed && (
            <div className="p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                © 2025 CareMap
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
