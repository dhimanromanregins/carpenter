export interface WoodFinish {
  id: string;
  label: string;
  base: string;
  ring: string;
}

export const FINISHES: WoodFinish[] = [
  { id: "walnut", label: "Walnut", base: "#5c3d24", ring: "#241407" },
  { id: "espresso", label: "Espresso", base: "#3b2515", ring: "#150c06" },
  { id: "honey", label: "Honey Oak", base: "#a67c52", ring: "#4a3018" },
  { id: "ivory", label: "Ivory Ash", base: "#c9b89a", ring: "#8a7458" },
];
