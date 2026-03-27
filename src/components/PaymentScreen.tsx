export default function PaymentScreen({ onPay, isPaying }: { onPay: () => void, isPaying?: boolean }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 text-white">
      <div className="bg-surface p-8 rounded-2xl flex flex-col items-center max-w-sm w-full border border-neon-rose shadow-neon-rose">
        <div className="text-6xl mb-6 drop-shadow-md">😭</div>
        <h2 className="text-3xl font-display font-black mb-2 text-center text-neon-rose drop-shadow-md">You Lost!</h2>
        <p className="text-slate-400 text-center mb-8 font-medium">Time to pay up for the table.</p>
        
        <button
          onClick={onPay}
          disabled={isPaying}
          className="w-full bg-foreground text-background py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPaying ? (
            <span className="animate-pulse">Processing...</span>
          ) : (
            <>
              {/* Apple icon approximation */}
              <svg viewBox="0 0 384 512" className="w-5 h-5 fill-current">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
              </svg>
              Pay
            </>
          )}
        </button>
      </div>
    </div>
  );
}
