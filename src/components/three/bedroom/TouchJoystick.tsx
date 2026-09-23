import { useRef, useState } from "react";
import { walkInput } from "./bedroomState";

const RADIUS = 48;

/** Virtual thumbstick for touch devices; writes straight into walkInput. */
export function TouchJoystick() {
  const base = useRef<HTMLDivElement>(null);
  const active = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const update = (clientX: number, clientY: number) => {
    const rect = base.current!.getBoundingClientRect();
    let dx = clientX - (rect.left + rect.width / 2);
    let dy = clientY - (rect.top + rect.height / 2);
    const len = Math.hypot(dx, dy);
    if (len > RADIUS) {
      dx = (dx / len) * RADIUS;
      dy = (dy / len) * RADIUS;
    }
    setKnob({ x: dx, y: dy });
    walkInput.joyX = dx / RADIUS;
    walkInput.joyY = -dy / RADIUS;
  };

  const release = () => {
    active.current = null;
    setKnob({ x: 0, y: 0 });
    walkInput.joyX = 0;
    walkInput.joyY = 0;
  };

  return (
    <div
      ref={base}
      className="pointer-events-auto relative h-32 w-32 touch-none rounded-full border border-white/40 bg-black/25 backdrop-blur-sm select-none"
      onPointerDown={(e) => {
        active.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        update(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (active.current === e.pointerId) update(e.clientX, e.clientY);
      }}
      onPointerUp={release}
      onPointerCancel={release}
      aria-label="Walk joystick"
      role="presentation"
    >
      <div
        className="absolute top-1/2 left-1/2 h-14 w-14 rounded-full border border-white/60 bg-white/70 shadow-lg"
        style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
      />
    </div>
  );
}
