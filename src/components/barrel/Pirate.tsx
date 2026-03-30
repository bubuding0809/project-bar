import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { useSpring, animated } from '@react-spring/three';

interface PirateProps {
  popped?: boolean;
}

const COLORS = {
  skin: '#FFCC80',
  bandana: '#E11D48',
  coat: '#2563EB',
};

export default function Pirate({ popped = false }: PirateProps) {
  const groupRef = useRef<Group>(null);
  
  const { animatedY, animatedRotation } = useSpring({
    animatedY: popped ? 0.8 : 0,
    animatedRotation: popped ? Math.PI * 2 : 0,
    config: { tension: 200, friction: 20 },
  });

  useFrame((state) => {
    if (!groupRef.current || popped) return;
    
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.z = Math.sin(t * 0.5) * 0.02;
    groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.1;
  });

  return (
    <animated.group
      ref={groupRef}
      position-y={animatedY}
      rotation-y={animatedRotation}
    >
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={COLORS.skin} roughness={0.8} />
      </mesh>
      
      <mesh position={[0, 0.45, 0]}>
        <torusGeometry args={[0.12, 0.04, 8, 16]} />
        <meshStandardMaterial color={COLORS.bandana} roughness={0.9} />
      </mesh>
      
      <mesh position={[-0.05, 0.37, 0.12]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.05, 0.37, 0.12]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      <mesh position={[0, 0.1, 0]}>
        <capsuleGeometry args={[0.12, 0.25, 8, 16]} />
        <meshStandardMaterial color={COLORS.coat} roughness={0.9} />
      </mesh>
    </animated.group>
  );
}
