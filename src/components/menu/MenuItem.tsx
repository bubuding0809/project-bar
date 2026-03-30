import React from 'react';
import { Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';

interface MenuItemProps {
  id: string;
  title: string;
  price: number;
  description?: string;
  imgUrl: string;
  tableId?: string;
}

export const MenuItem: React.FC<MenuItemProps> = ({ id, title, price, description, imgUrl, tableId }) => {
  const addItem = useCartStore((state) => state.addItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const cartItem = useCartStore((state) =>
    state.items.find(item => item.id === id && item.customizations === undefined)
  );
  const quantity = cartItem?.quantity ?? 0;
  const href = tableId ? `/table/${tableId}/menu/${id}` : `/menu/${id}`;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id, title, price, quantity: 1 });
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      decrementItem(cartItem.cartItemId);
    }
  };

  return (
    <div className="flex justify-between gap-4 py-4 border-b hover:bg-muted/50 transition-colors">
      <Link href={href} className="flex flex-col gap-1 justify-center flex-1">
        <h3 className="font-semibold text-base">{title}</h3>
        {description && <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>}
        <span className="font-medium mt-1">${price.toFixed(2)}</span>
      </Link>
      <div className="relative w-[104px] h-[104px] rounded-md overflow-hidden bg-muted flex-shrink-0">
        <img src={imgUrl} alt={title} className="object-cover w-full h-full" />
        {quantity < 2 ? (
          <button
            className="absolute bottom-[-12px] right-2 w-8 h-8 rounded-full bg-background border shadow-sm flex items-center justify-center translate-y-[-50%] hover:bg-muted transition-colors"
            onClick={handleAdd}
            aria-label="Add to cart"
          >
            <Plus size={14} />
          </button>
        ) : (
          <div className="absolute bottom-[-12px] right-2 h-8 rounded-full bg-background border shadow-sm flex items-center justify-center translate-y-[-50%] hover:bg-muted transition-all duration-150 gap-1 px-2 animate-in fade-in scale-in-100">
            <button
              className="w-6 h-6 flex items-center justify-center"
              onClick={handleDecrement}
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="text-sm font-medium w-4 text-center">{quantity}</span>
            <button
              className="w-6 h-6 flex items-center justify-center"
              onClick={handleAdd}
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};