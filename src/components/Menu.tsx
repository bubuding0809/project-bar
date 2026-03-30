"use client";

import React, { useEffect, useRef, useState } from 'react';
import { menuData } from '../data/menu';
import MenuItem from './MenuItem';

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState<string>(menuData[0].category);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const navRef = useRef<HTMLDivElement>(null);

  // Smooth scroll to category
  const scrollToCategory = (category: string) => {
    setActiveCategory(category);
    const element = categoryRefs.current[category];
    if (element) {
      const navHeight = navRef.current?.offsetHeight || 0;
      const top = element.getBoundingClientRect().top + window.scrollY - navHeight - 20; // 20px padding
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // Scroll spy to update active category
  useEffect(() => {
    const handleScroll = () => {
      if (!navRef.current) return;
      const navHeight = navRef.current.offsetHeight;
      
      let currentCategory = activeCategory;

      for (const [category, ref] of Object.entries(categoryRefs.current)) {
        if (!ref) continue;
        const rect = ref.getBoundingClientRect();
        
        // If element is in the active viewport region
        if (rect.top <= navHeight + 100 && rect.bottom >= navHeight) {
            currentCategory = category;
        }
      }
      
      if (currentCategory !== activeCategory) {
        setActiveCategory(currentCategory);
        
        // Scroll navigation bar to keep active item visible
        const activeNavBtn = document.getElementById(`nav-${currentCategory}`);
        if (activeNavBtn && typeof activeNavBtn.scrollIntoView === 'function') {
          activeNavBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeCategory]);

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto">
      {/* Sticky Navigation */}
      <div 
        ref={navRef}
        className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-slate-800 py-4 shadow-sm"
      >
        <div className="flex overflow-x-auto gap-2 px-4 snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {menuData.map((category) => (
            <button
              key={category.category}
              id={`nav-${category.category}`}
              onClick={() => scrollToCategory(category.category)}
              className={`whitespace-nowrap px-4 py-2 rounded-full font-medium transition-colors snap-start ${
                activeCategory === category.category
                  ? 'bg-primary text-white'
                  : 'bg-surface hover:bg-slate-800 text-slate-300'
              }`}
            >
              {category.category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Content */}
      <div className="p-4 space-y-10 mt-4 pb-24">
        {menuData.map((category) => (
          <div 
            key={category.category}
            ref={(el) => { categoryRefs.current[category.category] = el; }}
            className="scroll-mt-24" // Matches nav height approx
          >
            <h2 className="text-2xl font-bold font-display text-foreground mb-4">
              {category.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.items.map((item, idx) => (
                <MenuItem 
                  key={`${category.category}-${idx}`}
                  name={item.name}
                  price={item.price}
                  description={item.description}
                  imageUrl={item.imageUrl}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
