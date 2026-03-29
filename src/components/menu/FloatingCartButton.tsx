'use client';

import React from 'react';
import { useCartStore, selectTotalPrice } from '@/store/useCartStore';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export const FloatingCartButton = () => {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore(selectTotalPrice);
  
  if (items.length === 0) return null;
  
  return (
    <div className="fixed bottom-20 left-0 w-full px-6 flex justify-center z-50">
      <Button 
        onClick={() => router.push('/cart')}
        className="w-full max-w-[345px] rounded-full h-14 text-base font-semibold shadow-lg"
      >
        Cart [{items.length} Items] — ${totalPrice.toFixed(2)}
      </Button>
    </div>
  );
};
