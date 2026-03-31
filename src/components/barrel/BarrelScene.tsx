'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useState, useEffect, useRef } from 'react';
import Barrel from './Barrel';
import Pirate from './Pirate';

interface BarrelSceneProps {
  filledSlots: number[];
  triggerSlot: number;
  onSlotTap: (slotIndex: number) => void;
  isMyTurn: boolean;
  piratePopped: boolean;
  insertingSlot: number | null;
}

export default function BarrelScene({
  filledSlots,
  triggerSlot,
  onSlotTap,
  isMyTurn,
  piratePopped,
  insertingSlot,
}: BarrelSceneProps) {
  const [scale, setScale] = useState(1);
  const [cameraZ, setCameraZ] = useState(4);
  const [rotationY, setRotationY] = useState(0);
  const isDragging = useRef(false);
  const lastX = useRef(0);

  useEffect(() => {
    const updateScale = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const minDim = Math.min(width, height);
      const newScale = Math.min(1.3, Math.max(0.9, 420 / minDim));
      setScale(newScale);
      setCameraZ(minDim < 500 ? 5.0 : 5.5);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    lastX.current = e.clientX;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - lastX.current;
    setRotationY((prev) => prev + deltaX * 0.01);
    lastX.current = e.clientX;
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <Canvas
        camera={{ position: [0, 1.5, cameraZ], fov: 50 }}
        style={{ background: '#020617' }}
        dpr={Math.min(window.devicePixelRatio, 2)}
      >
        <ambientLight color="#FFF8E1" intensity={0.4} />
        <directionalLight
          color="#FFFFFF"
          intensity={1}
          position={[2, 4, 2]}
        />
        <pointLight color="#8B5CF6" intensity={0.5} position={[-2, 2, -2]} />
        
        <Suspense fallback={null}>
          <group position={[0, -0.3 * scale, 0]} scale={[scale, scale, scale]}>
            <Barrel
              filledSlots={filledSlots}
              triggerSlot={triggerSlot}
              onSlotTap={onSlotTap}
              isMyTurn={isMyTurn}
              insertingSlot={insertingSlot}
              rotationY={rotationY}
            />
            <Pirate popped={piratePopped} />
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
}
