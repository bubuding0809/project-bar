import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import SlotMesh from './SlotMesh';
import Sword from './Sword';

interface BarrelProps {
  filledSlots: number[];
  triggerSlot: number;
  onSlotTap: (slotIndex: number) => void;
  isMyTurn: boolean;
  insertingSlot: number | null;
  rotationY?: number;
}

const COLORS = {
  wood: '#5D4037',
  metal: '#37474F',
};

function generateSlotPositions() {
  const slots = [];
  // Slots AROUND the barrel body (like Pop-Up Pirate)
  // Barrel radius ~1.0, hoops at y=0.5, y=0.1, y=-0.3
  // Row 1: 12 slots between top and middle hoop (y ~ 0.3)
  // Row 2: 12 slots between middle and bottom hoop (y ~ -0.1)
  for (let row = 1; row <= 2; row++) {
    const radius = 1.08; // Slightly outside barrel surface
    const yPos = row === 1 ? 0.3 : -0.1; // Between hoops
    const angleOffset = row === 1 ? 0 : 15; // Offset row 2 by half slot
    for (let i = 0; i < 12; i++) {
      const angle = ((i * 30) + angleOffset) * (Math.PI / 180);
      slots.push({
        id: (row - 1) * 12 + i,
        x: radius * Math.sin(angle),
        y: yPos,
        z: radius * Math.cos(angle),
      });
    }
  }
  return slots;
}

const SLOT_COLORS = ['#C0C0C0', '#FFD700', '#CD7F32'];

export default function Barrel({
  filledSlots,
  triggerSlot: _triggerSlot,
  onSlotTap,
  isMyTurn,
  insertingSlot,
  rotationY = 0,
}: BarrelProps) {
  const groupRef = useRef<Group>(null);
  const autoRotationRef = useRef(0);

  useFrame((state) => {
    if (groupRef.current) {
      autoRotationRef.current = state.clock.elapsedTime * 0.08;
      groupRef.current.rotation.y = autoRotationRef.current + rotationY;
    }
  });

  const slots = generateSlotPositions();

  return (
    <group ref={groupRef}>
      {/* Main barrel body - slightly taller */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.1, 1.0, 1.5, 32]} />
        <meshStandardMaterial color={COLORS.wood} roughness={0.9} />
      </mesh>
      
      {/* Metal hoops around barrel - horizontal rings */}
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.12, 0.05, 8, 32]} />
        <meshStandardMaterial color={COLORS.metal} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.12, 0.05, 8, 32]} />
        <meshStandardMaterial color={COLORS.metal} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.12, 0.05, 8, 32]} />
        <meshStandardMaterial color={COLORS.metal} metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Top rim */}
      <mesh position={[0, 0.78, 0]}>
        <cylinderGeometry args={[1.05, 1.05, 0.08, 32]} />
        <meshStandardMaterial color={COLORS.wood} roughness={0.9} />
      </mesh>
      {/* Bottom rim */}
      <mesh position={[0, -0.78, 0]}>
        <cylinderGeometry args={[1.05, 1.05, 0.08, 32]} />
        <meshStandardMaterial color={COLORS.wood} roughness={0.9} />
      </mesh>

      {slots.map((slot) => {
        const slotIndex = slot.id;
        const isFilled = filledSlots.includes(slotIndex);
        const isActive = isMyTurn;
        const isInserting = slotIndex === insertingSlot;
        const swordColor = isFilled ? SLOT_COLORS[slotIndex % 3] : SLOT_COLORS[slotIndex % 3];
        const radialDir = { x: slot.x, z: slot.z };

        return (
          <group key={slot.id} position={[slot.x, slot.y, slot.z]}>
            <SlotMesh
              position={[0, 0, 0]}
              slotIndex={slotIndex}
              isFilled={isFilled}
              isActive={isActive}
              onTap={() => onSlotTap(slotIndex)}
              swordColor={swordColor}
            />
            {(isFilled || isInserting) && (
              <Sword
                position={[0, 0, 0]}
                radialDir={radialDir}
                color={swordColor}
                isInserted={isFilled}
                isInserting={isInserting}
              />
            )}
          </group>
        );
      })}
    </group>
  );
}
