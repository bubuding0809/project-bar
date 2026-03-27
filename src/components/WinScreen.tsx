export default function WinScreen() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 text-white">
      <div className="bg-surface p-8 rounded-2xl flex flex-col items-center max-w-sm w-full border border-neon-emerald shadow-neon-emerald">
        <div className="text-6xl mb-6 animate-bounce drop-shadow-md">🎉</div>
        <h2 className="text-3xl font-display font-black mb-2 text-center text-neon-emerald drop-shadow-md">You Win!</h2>
        <p className="text-slate-400 text-center font-medium">They are paying for the table.</p>
        <div className="mt-8 flex gap-2">
          {['💰', '🥂', '💸'].map((emoji, i) => (
            <div key={i} className="text-3xl animate-pulse" style={{ animationDelay: `${i * 200}ms` }}>
              {emoji}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
