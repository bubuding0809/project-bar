'use client';

import React from 'react';
import { BottomNav } from '@/components/menu/BottomNav';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">Coming soon</p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
