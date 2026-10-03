/** Lets DOM code (library drag-and-drop) ask the 3D scene where a screen point lands in the room. */
let picker: ((clientX: number, clientY: number, planeY: number) => [number, number] | null) | null = null;

export function registerPicker(fn: typeof picker) {
  picker = fn;
}

/** Plan position (mm) under a screen point, on a horizontal plane at height `planeY` metres. */
export function pickPlan(clientX: number, clientY: number, planeY = 0): [number, number] | null {
  return picker ? picker(clientX, clientY, planeY) : null;
}
