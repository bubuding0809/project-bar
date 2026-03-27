import { useState, useEffect } from 'react';

export default function PaymentScreen({ onPay, isPaying, tableId }: { onPay: () => Promise<void> | void, isPaying?: boolean, tableId: string }) {
  const [errorMsg, setErrorMsg] = useState('');
  const [localIsPaying, setLocalIsPaying] = useState(isPaying || false);

  const handlePay = async () => {
    setLocalIsPaying(true);
    try {
      await onPay();
    } catch {
      setErrorMsg('Payment Failed - Try Again');
      setLocalIsPaying(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch('/api/game/timeout', { method: 'POST', body: JSON.stringify({ tableId }) })
    }, 120000);
    return () => clearTimeout(timer);
  }, [tableId]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-rose-500 text-white">
      <h2 className="text-4xl font-bold mb-4">You Lost!</h2>
      {errorMsg && <p className="mb-4 bg-black/20 p-2 rounded">{errorMsg}</p>}
      <button onClick={handlePay} disabled={localIsPaying} className="bg-black py-3 px-6 rounded-lg font-bold disabled:opacity-50">
        {localIsPaying ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
}
