import React from 'react';
import { Plus } from 'lucide-react';

interface MenuItemProps {
  title: string;
  price: number;
  description?: string;
  imgUrl: string;
}

export const MenuItem: React.FC<MenuItemProps> = ({ title, price, description, imgUrl }) => {
  return (
    <div className="flex justify-between gap-4 py-4 border-b">
      <div className="flex flex-col gap-1 justify-center">
        <h3 className="font-semibold text-base">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        <span className="font-medium mt-1">${price.toFixed(2)}</span>
      </div>
      <div className="relative w-[104px] h-[104px] rounded-md overflow-hidden bg-muted flex-shrink-0">
        <img src={imgUrl} alt={title} className="object-cover w-full h-full" />
        <button className="absolute bottom-[-12px] right-2 w-8 h-8 rounded-full bg-background border shadow-sm flex items-center justify-center translate-y-[-50%]">
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
};
