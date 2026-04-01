"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Apple, CreditCard, Info, ChevronRight } from "lucide-react";
import { useCartStore, selectTotalPrice } from "@/store/useCartStore";
import { use } from "react";

export default function PaymentPage({ params }: { params: Promise<{ tableId: string }> }) {
  const router = useRouter();
  const { tableId } = use(params);
  const subtotal = useCartStore(selectTotalPrice);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handlePayment = () => {
    router.push(`/table/${tableId}/confirmed`);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-rose-500/30">
      <header className="px-6 pt-12 pb-6 flex items-center gap-4 sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-white/5">
        <button 
          onClick={() => router.back()} 
          className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-display font-medium tracking-tight">Checkout</h1>
      </header>

      <main className="flex-1 px-6 py-8 flex flex-col gap-10">
        
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">Order Summary</h2>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center text-white/80">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-white/80">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="h-px bg-white/10 w-full my-2" />
            <div className="flex justify-between items-center text-xl font-medium">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </section>

        <section className="animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both">
          <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">Payment Method</h2>
          <div className="space-y-3">
            <button 
              onClick={handlePayment}
              className="w-full bg-white text-black p-5 rounded-2xl flex items-center justify-between group hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)]"
            >
              <div className="flex items-center gap-3">
                <Apple className="w-6 h-6 fill-black" />
                <span className="font-semibold text-lg">Pay</span>
              </div>
              <ChevronRight className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>

            <button 
              onClick={handlePayment}
              className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between group hover:bg-white/10 active:scale-[0.98] transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-7 bg-white/10 rounded flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white/70" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-medium">VISA</span>
                  <span className="text-sm text-white/50">Ending in 4242</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/70 transition-colors" />
            </button>
          </div>
        </section>

      </main>

      <footer className="px-6 pb-[calc(3rem+env(safe-area-inset-bottom))] pt-6 mt-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
        <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-200/80 leading-relaxed">
            You will not be charged now. Your card will be authorized and the final amount will be captured when you close your tab at the end of the night.
          </p>
        </div>
      </footer>
    </div>
  );
}
