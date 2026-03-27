export default function WinScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-emerald-500 text-white">
      <h2 className="text-4xl font-bold mb-4">You Win!</h2>
      <p>Waiting for the loser to pay...</p>
    </div>
  );
}
