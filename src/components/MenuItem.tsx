import React from 'react';
import Image from 'next/image';

interface MenuItemProps {
  id?: string;
  name: string;
  description?: string;
  price: number | string;
  imageUrl?: string | null;
}

export default function MenuItem({ id, name, description, price, imageUrl }: MenuItemProps) {
  const formattedPrice = typeof price === 'number' ? price.toFixed(2) : price;

  return (
    <div data-id={id} className="bg-surface rounded-xl p-4 flex gap-4 border border-slate-800 shadow-sm hover:border-slate-700 transition-colors">
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-foreground font-display tracking-wide">{name}</h3>
          <span className="text-primary font-semibold font-display">${formattedPrice}</span>
        </div>
        {description && <p className="text-slate-400 text-sm leading-relaxed mb-2 line-clamp-2">{description}</p>}
      </div>
      {imageUrl && (
        <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-slate-800/50 relative">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 96px) 100vw, 96px"
          />
        </div>
      )}
    </div>
  );
}