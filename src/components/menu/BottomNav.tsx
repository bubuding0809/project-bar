import React from 'react';
import { Home, Search, ShoppingCart, User } from 'lucide-react';

export const BottomNav = () => (
  <div className="fixed bottom-0 left-0 w-full bg-background border-t h-14 flex items-center justify-around px-4">
    <Home size={24} />
    <Search size={24} />
    <ShoppingCart size={24} />
    <User size={24} />
  </div>
);
