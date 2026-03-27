import React from 'react';

interface MenuItemProps {
  id: string;
  name: string;
  description: string;
  price: string;
}

export default function MenuItem({ id, name, description, price }: MenuItemProps) {
  return (
    <div data-id={id} className="bg-surface rounded-xl p-4 mb-4 border border-slate-800 shadow-sm hover:border-slate-700 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-foreground font-display tracking-wide">{name}</h3>
        <span className="text-primary font-semibold font-display">{price}</span>
      </div>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}