'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MenuItem } from '@/components/menu/MenuItem';
import { FloatingCartButton } from '@/components/menu/FloatingCartButton';
import { BottomNav } from '@/components/menu/BottomNav';
import { menuData } from '@/data/menu';
import { generateItemId } from '@/lib/utils';

interface MenuProps {
  tableId?: string;
}

export default function Menu({ tableId }: MenuProps) {
  const [activeCategory, setActiveCategory] = useState(menuData[0]?.category || '');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const category = entry.target.getAttribute('data-category');
            if (category) {
              setActiveCategory(category);
            }
          }
        });
      },
      {
        rootMargin: '-120px 0px -50% 0px',
        threshold: 0,
      }
    );

    menuData.forEach((cat) => {
      const element = document.getElementById(`category-${cat.category}`);
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeCategory]);

  const scrollToCategory = (category: string) => {
    setActiveCategory(category);
    const element = document.getElementById(`category-${category}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto pb-20">
      {/* Sticky Header - matching /menu page styling */}
      <div className="sticky top-0 z-40 w-full bg-background border-b shadow-sm">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-xl font-bold">Bar Lorong 13</h1>
          <Button variant="ghost" className="p-2 -mr-2 text-muted-foreground hover:text-foreground">
            <Search size={24} />
          </Button>
        </div>
        
        {/* Category Tabs */}
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max px-4">
            {menuData.map((cat) => (
              <button
                key={cat.category}
                ref={activeCategory === cat.category ? activeTabRef : undefined}
                onClick={() => scrollToCategory(cat.category)}
                className={`text-sm font-semibold transition-colors px-4 py-3 border-b-2 ${
                  activeCategory === cat.category 
                    ? 'text-primary border-primary' 
                    : 'text-muted-foreground border-transparent hover:text-foreground'
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </div>

      {/* Menu List */}
      <main className="px-4 py-6 space-y-8">
        {menuData.map((cat) => (
          <div key={cat.category} id={`category-${cat.category}`} data-category={cat.category} className="scroll-mt-[120px]">
            <h2 className="text-xl font-bold mb-4">{cat.category}</h2>
            <div className="space-y-0">
              {cat.items.map((item, index) => {
                const itemId = generateItemId(item.name);
                return (
                  <MenuItem
                    key={`${cat.category}-${index}`}
                    id={itemId}
                    title={item.name}
                    price={item.price as number}
                    description={item.description}
                    imgUrl={item.imageUrl || ''}
                    tableId={tableId}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </main>

      {/* Floating Cart Button */}
      <FloatingCartButton tableId={tableId} />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
