import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh, MeshStandardMaterial } from 'three';

interface SlotMeshProps {
  position: [number, number, number];
  slotIndex: number;
  isFilled: boolean;
  isActive: boolean;
  onTap: () => void;
  swordColor?: string;
}

export default function SlotMesh({
  position,
  slotIndex: _slotIndex,
  isFilled,
  isActive: _isActive,
  onTap,
  swordColor = '#C0C0C0',
}: SlotMeshProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (!meshRef.current) return;
    
    const material = meshRef.current.material as MeshStandardMaterial;
    
    if (hovered && !isFilled) {
      material.emissiveIntensity = 0.4;
    } else {
      material.emissiveIntensity = 0;
    }
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (!isFilled) {
      onTap();
    }
  };

  return (
    <group position={position}>
      {/* Dark hole - cylinder recessed into barrel surface */}
      <mesh
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <cylinderGeometry args={[0.06, 0.06, 0.08, 12]} />
        <meshStandardMaterial
          color={isFilled ? swordColor : '#050505'}
          emissive="#000000"
          emissiveIntensity={0}
          metalness={0.1}
          roughness={0.9}
        />
      </mesh>
      
      {/* Sword sticking out when filled */}
      {isFilled && swordColor && (
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.12, 8]} />
          <meshStandardMaterial
            color={swordColor}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      )}
    </group>
  );
}
