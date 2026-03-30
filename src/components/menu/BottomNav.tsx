'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, usePathname } from 'next/navigation';
import { Search, ShoppingCart, User, Dice5 } from 'lucide-react';

const navItems = [
  { view: 'menu', icon: Search, label: 'Menu' },
  { view: 'games', icon: Dice5, label: 'Games' },
  { route: '/cart', icon: ShoppingCart, label: 'Cart' },
  { route: '/profile', icon: User, label: 'Profile' },
];

export const BottomNav = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const tableId = params?.tableId as string;
  const activeView = searchParams.get('view') || 'menu';

  const getHref = (item: typeof navItems[0]) => {
    if (!tableId) return '/';
    if ('route' in item && item.route) return `/table/${tableId}${item.route}`;
    if ('view' in item) {
      if (item.view === 'menu') return `/table/${tableId}`;
      return `/table/${tableId}?view=${item.view}`;
    }
    return '/';
  };

  const isActive = (item: typeof navItems[0]) => {
    if ('route' in item && item.route) {
      return pathname === `/table/${tableId}${item.route}`;
    }
    if ('view' in item) return item.view === activeView;
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-background border-t h-14 flex items-center justify-around px-4 z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item);
        return (
          <Link
            key={'view' in item ? item.view : item.route}
            href={getHref(item)}
            className={`flex flex-col items-center gap-0.5 transition-colors ${
              active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon size={22} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};
