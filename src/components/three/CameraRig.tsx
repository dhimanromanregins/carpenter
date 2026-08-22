import { useFrame, useThree } from "@react-three/fiber";
import { lerp } from "@/lib/utils";

interface CameraRigProps {
  strength?: number;
  baseZ?: number;
}

export function CameraRig({ strength = 1, baseZ = 9 }: CameraRigProps) {
  const { camera, pointer } = useThree();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const targetX = pointer.x * 0.7 * strength + Math.sin(t * 0.08) * 0.2;
    const targetY = pointer.y * 0.35 * strength + Math.cos(t * 0.06) * 0.1 + 0.3;
    const targetZ = baseZ - Math.abs(pointer.x) * 0.3;

    camera.position.x = lerp(camera.position.x, targetX, 0.025);
    camera.position.y = lerp(camera.position.y, targetY, 0.025);
    camera.position.z = lerp(camera.position.z, targetZ, 0.025);
    camera.lookAt(0, 0.2, 0);
  });

  return null;
}
