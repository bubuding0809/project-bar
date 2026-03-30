import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';

interface SwordProps {
  position: [number, number, number];
  radialDir: { x: number; z: number };
  color: string;
  isInserted: boolean;
  isInserting: boolean;
}

export default function Sword({ position, radialDir, color, isInserted, isInserting }: SwordProps) {
  const groupRef = useRef<Group>(null);
  
  const len = Math.sqrt(radialDir.x * radialDir.x + radialDir.z * radialDir.z);
  const dirX = len > 0 ? -radialDir.x / len : 0;
  const dirZ = len > 0 ? -radialDir.z / len : 0;

  const startDist = 1.2;
  const currentOffset = useRef(isInserted || !isInserting ? 0 : startDist);
  const currentAngle = useRef(isInserted || !isInserting ? 0 : Math.PI * 0.3);

  useFrame(() => {
    if (!groupRef.current) return;

    if (isInserting && !isInserted) {
      const diff = 0 - currentOffset.current;
      if (Math.abs(diff) > 0.01) {
        currentOffset.current += diff * 0.18;
      } else {
        currentOffset.current = 0;
      }

      const angleDiff = 0 - currentAngle.current;
      if (Math.abs(angleDiff) > 0.01) {
        currentAngle.current += angleDiff * 0.15;
      } else {
        currentAngle.current = 0;
      }

      groupRef.current.position.x = dirX * currentOffset.current;
      groupRef.current.position.z = dirZ * currentOffset.current;
      groupRef.current.rotation.y = currentAngle.current;
    } else if (isInserted) {
      if (currentOffset.current !== 0) {
        currentOffset.current = 0;
        groupRef.current.position.x = 0;
        groupRef.current.position.z = 0;
      }
      if (currentAngle.current !== 0) {
        currentAngle.current = 0;
        groupRef.current.rotation.y = 0;
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <mesh rotation={[0, Math.atan2(dirX, dirZ), -Math.PI / 2]}>
        <coneGeometry args={[0.025, 0.35, 8]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-0.2, 0, 0]} rotation={[0, Math.atan2(dirX, dirZ), -Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.02, 0.12, 8]} />
        <meshStandardMaterial color="#3D2314" roughness={0.8} />
      </mesh>
      <mesh position={[-0.28, 0, 0]} rotation={[0, Math.atan2(dirX, dirZ), -Math.PI / 2]}>
        <boxGeometry args={[0.03, 0.07, 0.02]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}
