import { useEffect, useState } from 'react';
import { PlayerProfile } from '@/types/game';

interface SpinWheelProps {
  players: PlayerProfile[];
  loserId: string;
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
  '#98D8C8', '#F06292', '#AED581', '#FFD54F',
  '#BA68C8', '#4DB6AC', '#FF8A65', '#7986CB'
];

export default function SpinWheel({ players, loserId }: SpinWheelProps) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!players.length || !loserId) return;

    const loserIndex = players.findIndex(p => p.userId === loserId);
    if (loserIndex === -1) return;

    const sliceAngle = 360 / players.length;
    // Calculate the middle of the loser's slice
    const targetSliceMiddle = (loserIndex * sliceAngle) + (sliceAngle / 2);
    // To land the middle of the slice at the top (0 degrees), we rotate 360 - target
    const targetRotation = 360 - targetSliceMiddle;
    
    // Add 10 full spins (360 * 10) for drama
    const finalRotation = (360 * 10) + targetRotation;

    // Use a small timeout to ensure the initial 0deg state is rendered before triggering transition
    const timeout = setTimeout(() => {
      setRotation(finalRotation);
    }, 50);

    return () => clearTimeout(timeout);
  }, [players, loserId]);

  if (!players.length) return null;

  const sliceAngle = 360 / players.length;
  
  // Generate the conic gradient stops
  const gradientStops = players.map((_, index) => {
    const startAngle = index * sliceAngle;
    const endAngle = (index + 1) * sliceAngle;
    const color = COLORS[index % COLORS.length];
    return `${color} ${startAngle}deg ${endAngle}deg`;
  }).join(', ');

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative w-80 h-80">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-10 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-gray-800 drop-shadow-md" />
        
        {/* Wheel */}
        <div 
          className="w-full h-full rounded-full border-4 border-white shadow-xl overflow-hidden"
          style={{
            background: `conic-gradient(${gradientStops})`,
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 10s cubic-bezier(0.2, 0.8, 0.2, 1)', // ease-out over exactly 10 seconds
          }}
        >
          {/* Labels - positioned in the middle of each slice */}
          {players.map((player, index) => {
            const middleAngle = (index * sliceAngle) + (sliceAngle / 2);
            return (
              <div
                key={player.userId}
                className="absolute w-full h-full flex justify-center pt-6 pointer-events-none"
                style={{
                  transform: `rotate(${middleAngle}deg)`,
                }}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl drop-shadow-md">{player.emoji}</span>
                  <span className="text-xs font-bold text-white bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm truncate max-w-[80px]">
                    {player.nickname}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-inner border-2 border-gray-200" />
      </div>
      
      <div className="mt-8 text-center animate-pulse">
        <h3 className="text-xl font-bold text-gray-800">Spinning the Wheel of Destiny...</h3>
        <p className="text-gray-500">Who will pay the bill?</p>
      </div>
    </div>
  );
}
