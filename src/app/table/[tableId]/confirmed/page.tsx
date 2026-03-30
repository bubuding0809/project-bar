"use client";

import { useCartStore } from "@/store/useCartStore";
import { CheckCircle } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { use } from "react";

export default function ConfirmedPage({ params }: { params: Promise<{ tableId: string }> }) {
  const router = useRouter();
  const { tableId } = use(params);
  const clearCart = useCartStore((state) => state.clearCart);

  const handleBackToMenu = () => {
    clearCart();
    router.push(`/table/${tableId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="mb-6 rounded-full bg-green-100 p-4">
        <CheckCircle className="w-20 h-20 text-green-600" strokeWidth={2.5} />
      </div>
      <h1 className="text-3xl font-bold mb-3 text-gray-900">Order Submitted!</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-sm">
        Your order has been successfully added to your tab. We&apos;re preparing it now.
      </p>
      
      <button
        onClick={handleBackToMenu}
        className="px-8 py-4 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-colors w-full max-w-xs shadow-md"
      >
        Back to Menu
      </button>
    </div>
  );
}
