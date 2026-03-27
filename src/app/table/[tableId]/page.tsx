import React from "react";
import menuData from "@/data/menu.json";
import MenuItem from "@/components/MenuItem";
import Link from "next/link";

type Props = {
  params: Promise<{
    tableId: string;
  }>;
};

export default async function TableMenuPage({ params }: Props) {
  const { tableId } = await params;

  return (
    <div className="min-h-screen bg-background text-foreground pb-28 relative">
      {/* Header */}
      <header className="pt-10 pb-6 px-6 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b border-surface">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-black bg-gradient-to-r from-neon-violet to-primary bg-clip-text text-transparent">
              Neon Nights
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Table #{tableId} • Menu
            </p>
          </div>
        </div>
      </header>

      {/* Menu Content */}
      <main className="px-6 py-8 space-y-12 max-w-2xl mx-auto">
        {menuData.categories.map((category, index) => (
          <section key={index} className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-foreground border-b border-surface pb-2">
              {category.name}
            </h2>
            <div className="space-y-4">
              {category.items.map((item) => (
                <MenuItem
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  description={item.description}
                  price={item.price}
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Floating CTA Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none flex justify-center pb-8 z-20">
        <Link 
          href={`/table/${tableId}/roulette`}
          className="pointer-events-auto flex items-center justify-center gap-3 w-full max-w-sm py-4 px-6 rounded-full bg-gradient-to-r from-neon-violet to-primary shadow-neon-violet text-white font-bold text-lg font-display hover:scale-[1.02] active:scale-95 transition-all duration-200"
        >
          <span>Play Drink Roulette</span>
          <span className="text-2xl leading-none">🎰</span>
        </Link>
      </div>
    </div>
  );
}