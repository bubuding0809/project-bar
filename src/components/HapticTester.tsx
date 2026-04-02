"use client";

import { useState } from "react";
import { useWebHaptics } from "web-haptics/react";
import { defaultPatterns } from "web-haptics";

const PRESETS = Object.keys(defaultPatterns);

export function HapticTester() {
  const [debugAudio, setDebugAudio] = useState(false);
  const [customInput, setCustomInput] = useState("100, 50, 100, 50, 200");
  const [error, setError] = useState<string | null>(null);

  const { trigger, isSupported } = useWebHaptics({ debug: debugAudio });

  const handlePresetClick = (preset: string) => {
    trigger(preset);
  };

  const handleCustomTrigger = () => {
    try {
      setError(null);
      // Parse the comma separated string to an array of numbers
      const parsedArray = customInput.split(",").map((s) => {
        const val = parseInt(s.trim(), 10);
        if (isNaN(val)) throw new Error("Invalid number");
        return val;
      });
      trigger(parsedArray);
    } catch (err) {
      setError("Invalid custom array format. Please enter comma-separated numbers.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-slate-800">Haptics Playground</h1>
        <p className="text-slate-600">
          Test various vibration patterns.{" "}
          {!isSupported && (
            <span className="text-amber-600 font-semibold">
              (Haptics API is not natively supported on this device/browser. Use debug audio.)
            </span>
          )}
        </p>
      </div>

      {/* Debug Toggle */}
      <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-slate-200">
        <input
          type="checkbox"
          id="debug-audio"
          checked={debugAudio}
          onChange={(e) => setDebugAudio(e.target.checked)}
          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
        />
        <label htmlFor="debug-audio" className="font-medium text-slate-700 cursor-pointer">
          Enable Debug Audio
        </label>
        <span className="text-sm text-slate-500 ml-2">
          (Plays sound to simulate haptics on desktop)
        </span>
      </div>

      {/* Presets Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-slate-800">Presets</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => handlePresetClick(preset)}
              className="px-4 py-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 active:bg-blue-100 font-medium text-slate-700 capitalize"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Input */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-slate-800">Custom Array</h2>
        <div className="flex flex-col space-y-3">
          <div className="flex space-x-3">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. 100, 50, 100"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
            />
            <button
              onClick={handleCustomTrigger}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg shadow-sm hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 font-medium"
            >
              Test Custom
            </button>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <p className="text-sm text-slate-500">
            Enter alternating vibration and pause durations in milliseconds.
          </p>
        </div>
      </div>
    </div>
  );
}
