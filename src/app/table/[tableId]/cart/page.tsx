'use client';

import { useCartStore, selectTotalPrice } from '@/store/useCartStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, Info } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { use } from 'react';

export default function CartPage({ params }: { params: Promise<{ tableId: string }> }) {
  const router = useRouter();
  const { tableId } = use(params);
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore(selectTotalPrice);

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center p-4 border-b sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Your Tab</h1>
        <span className="ml-2 text-sm text-muted-foreground">Table #{tableId}</span>
      </header>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6 pb-32">
          <div className="rounded-lg border p-4 space-y-4">
            {items.map((item) => (
              <div key={item.cartItemId} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium">
                    {item.quantity}x {item.title}
                  </p>
                  {item.customizations && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {item.customizations.iceLevel && <p>Ice: {item.customizations.iceLevel}</p>}
                      {item.customizations.sugarLevel && <p>Sugar: {item.customizations.sugarLevel}</p>}
                    </div>
                  )}
                </div>
                <div className="font-semibold text-right pl-4">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}

            <Separator />

            <div className="flex justify-between items-center pt-2">
              <span className="font-semibold">Total (inc. GST)</span>
              <span className="text-lg font-bold">${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <Card className="bg-muted border-muted">
            <CardContent className="p-4 flex gap-3 items-start">
              <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium">Payment at End of Night</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your order will be added to your tab. We can settle the bill at the counter when you&apos;re ready to leave.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      <div className="p-4 border-t z-10">
        <Button onClick={() => router.push(`/table/${tableId}/payment`)} className="w-full text-lg h-14" size="lg">
          Submit Order to Tab
        </Button>
      </div>
    </div>
  );
}
