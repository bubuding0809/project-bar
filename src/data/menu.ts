import menuDataRaw from './menu.json';

export interface MenuItem {
  name: string;
  price: number | string;
  description?: string;
  imageUrl?: string | null;
}

export interface MenuCategory {
  category: string;
  items: MenuItem[];
}

export const menuData: MenuCategory[] = menuDataRaw.categories.map((cat: any) => {
  let items: any[] = cat.items || [];
  
  if (cat.subcategories) {
    cat.subcategories.forEach((sub: any) => {
      items = [...items, ...(sub.items || [])];
    });
  }
  
  return {
    category: cat.name,
    items: items.map(item => ({
      name: item.name,
      price: item.price,
      description: item.description,
      imageUrl: item.image
    }))
  };
}).filter(cat => cat.items.length > 0);
