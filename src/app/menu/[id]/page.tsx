'use client';

import React, { useState, use } from 'react';
import { ChevronLeft, Minus, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/useCartStore';
import { menuData } from '@/data/menu';
import { generateItemId } from '@/lib/utils';

const ICE_LEVELS = ['Normal Ice', 'Less Ice', 'No Ice'];
const SUGAR_LEVELS = ['Normal Sugar', 'Less Sugar', 'No Sugar'];

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const addItem = useCartStore((state) => state.addItem);

  // Find the item from menu data or fallback
  let foundItem = null;
  for (const cat of menuData) {
    const item = cat.items.find((i) => generateItemId(i.name) === id);
    if (item) {
      foundItem = item;
      break;
    }
  }

  const item = {
    id: id || '1',
    title: foundItem?.name || 'Aroi Cha Yen',
    price: typeof foundItem?.price === 'number' ? foundItem.price : 18.00,
    description: foundItem?.description || 'A classic Thai milk tea with rich, creamy flavor and perfect sweetness. Authentic taste.',
    imageUrl: foundItem?.imageUrl || 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=800&h=600',
  };

  const [quantity, setQuantity] = useState(1);
  const [iceLevel, setIceLevel] = useState(ICE_LEVELS[0]);
  const [sugarLevel, setSugarLevel] = useState(SUGAR_LEVELS[0]);

  const handleAddToCart = () => {
    addItem({
      id: item.id,
      title: item.title,
      price: item.price,
      quantity,
      customizations: {
        iceLevel,
        sugarLevel,
      },
    });
    router.push('/menu');
  };

  return (
    <div className="min-h-screen bg-background pb-[100px]">
      {/* Header / Hero Image */}
      <div className="relative w-full h-[300px] bg-muted">
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft size={24} />
        </button>
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="px-4 pt-6 space-y-8">
        {/* Title & Description */}
        <div>
          <div className="flex justify-between items-start gap-4">
            <h1 className="text-2xl font-bold">{item.title}</h1>
            <span className="text-xl font-semibold">${item.price.toFixed(2)}</span>
          </div>
          <p className="mt-2 text-muted-foreground">{item.description}</p>
        </div>

        {/* Customizers */}
        <div className="space-y-6">
          {/* Ice Level */}
          <div className="space-y-3">
            <h3 className="font-semibold">Ice Level</h3>
            <div className="flex flex-wrap gap-2">
              {ICE_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setIceLevel(level)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    iceLevel === level
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Sugar Level */}
          <div className="space-y-3">
            <h3 className="font-semibold">Sugar Level</h3>
            <div className="flex flex-wrap gap-2">
              {SUGAR_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setSugarLevel(level)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    sugarLevel === level
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 bg-muted rounded-full px-2 py-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 rounded-full hover:bg-background transition-colors disabled:opacity-50"
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <span className="font-medium w-4 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 rounded-full hover:bg-background transition-colors"
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>
          <Button
            className="flex-1 h-12 rounded-full text-base font-semibold"
            onClick={handleAddToCart}
          >
            Add to Cart - ${(item.price * quantity).toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  );
}
