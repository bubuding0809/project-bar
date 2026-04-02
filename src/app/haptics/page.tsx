import { HapticTester } from "@/components/HapticTester";

export default function HapticsPage() {
  return (
    <div className="min-h-screen p-8 bg-slate-50 text-slate-900 font-sans">
      <div className="max-w-2xl mx-auto">
        <HapticTester />
      </div>
    </div>
  );
}
