import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Mesh } from 'three';

interface PirateProps {
  position?: [number, number, number];
  scale?: number;
  isPanicking?: boolean;
}

const COLORS = {
  skin: '#E8B89D',
  bandana: '#C41E3A',
  bandanaDark: '#8B0000',
  shirt: '#2C3E50',
  shirtAccent: '#1A252F',
  pants: '#4A3728',
  belt: '#3D2314',
  buckle: '#D4AF37',
  boots: '#1C1C1C',
  eye: '#2C1810',
};

export default function Pirate({ position = [0, 0, 0], scale = 1, isPanicking = false }: PirateProps) {
  const groupRef = useRef<Group>(null);
  const bodyRef = useRef<Mesh>(null);
  const leftArmRef = useRef<Mesh>(null);
  const rightArmRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const t = state.clock.elapsedTime;
    
    if (isPanicking) {
      groupRef.current.rotation.z = Math.sin(t * 8) * 0.15;
      groupRef.current.rotation.x = Math.sin(t * 6) * 0.05;
      if (leftArmRef.current) leftArmRef.current.rotation.z = Math.sin(t * 10) * 0.3;
      if (rightArmRef.current) rightArmRef.current.rotation.z = -Math.sin(t * 10) * 0.3;
    } else {
      groupRef.current.rotation.z = Math.sin(t * 0.5) * 0.02;
      if (leftArmRef.current) leftArmRef.current.rotation.z = Math.sin(t * 2) * 0.05 - 0.1;
      if (rightArmRef.current) rightArmRef.current.rotation.z = -Math.sin(t * 2) * 0.05 + 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color={COLORS.skin} roughness={0.8} />
      </mesh>

      <mesh position={[0, 1.15, 0]}>
        <sphereGeometry args={[0.24, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={COLORS.bandana} roughness={0.9} />
      </mesh>

      <mesh position={[0, 1.35, 0]} rotation={[Math.PI / 6, 0, 0]}>
        <coneGeometry args={[0.18, 0.25, 8]} />
        <meshStandardMaterial color={COLORS.bandana} roughness={0.9} />
      </mesh>

      <mesh position={[-0.08, 0.92, 0.22]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={COLORS.eye} />
      </mesh>
      <mesh position={[0.08, 0.92, 0.22]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={COLORS.eye} />
      </mesh>

      <mesh position={[0, 0.82, 0.26]}>
        <boxGeometry args={[0.08, 0.02, 0.02]} />
        <meshStandardMaterial color={COLORS.bandanaDark} />
      </mesh>

      <mesh position={[0, 0.5, 0]} ref={bodyRef}>
        <capsuleGeometry args={[0.22, 0.45, 8, 16]} />
        <meshStandardMaterial color={COLORS.shirt} roughness={0.95} />
      </mesh>

      <mesh position={[0, 0.48, 0.22]}>
        <boxGeometry args={[0.1, 0.15, 0.02]} />
        <meshStandardMaterial color={COLORS.shirtAccent} />
      </mesh>

      <mesh position={[-0.35, 0.6, 0]} ref={leftArmRef}>
        <capsuleGeometry args={[0.08, 0.35, 4, 8]} />
        <meshStandardMaterial color={COLORS.shirt} roughness={0.95} />
      </mesh>

      <mesh position={[0.35, 0.6, 0]} ref={rightArmRef}>
        <capsuleGeometry args={[0.08, 0.35, 4, 8]} />
        <meshStandardMaterial color={COLORS.shirt} roughness={0.95} />
      </mesh>

      <mesh position={[-0.38, 0.35, 0.02]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color={COLORS.skin} roughness={0.8} />
      </mesh>
      <mesh position={[0.38, 0.35, 0.02]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color={COLORS.skin} roughness={0.8} />
      </mesh>

      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.35, 12]} />
        <meshStandardMaterial color={COLORS.pants} roughness={0.9} />
      </mesh>

      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.2, 0.08, 0.15, 12]} />
        <meshStandardMaterial color={COLORS.belt} roughness={0.8} />
      </mesh>

      <mesh position={[0, -0.05, 0.12]}>
        <boxGeometry args={[0.08, 0.08, 0.03]} />
        <meshStandardMaterial color={COLORS.buckle} metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh position={[-0.12, -0.3, 0.05]}>
        <capsuleGeometry args={[0.08, 0.35, 4, 8]} />
        <meshStandardMaterial color={COLORS.pants} roughness={0.9} />
      </mesh>
      <mesh position={[0.12, -0.3, 0.05]}>
        <capsuleGeometry args={[0.08, 0.35, 4, 8]} />
        <meshStandardMaterial color={COLORS.pants} roughness={0.9} />
      </mesh>

      <mesh position={[-0.12, -0.55, 0.08]}>
        <boxGeometry args={[0.12, 0.18, 0.22]} />
        <meshStandardMaterial color={COLORS.boots} roughness={0.7} />
      </mesh>
      <mesh position={[0.12, -0.55, 0.08]}>
        <boxGeometry args={[0.12, 0.18, 0.22]} />
        <meshStandardMaterial color={COLORS.boots} roughness={0.7} />
      </mesh>
    </group>
  );
}
