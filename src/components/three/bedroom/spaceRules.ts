import type { openingState } from "./bedroomState";

// Visibility rules for each part of the home (spaces: 0 bedroom, 1 hall,
// 2 deck, 3 front garden). A door counts as a view as soon as it starts
// opening, so nothing pops in while it swings.
export const seesBedroom = (s: number, o: typeof openingState) => s === 0 || ((s === 1 || s === 2) && o.door > 0.001);
export const seesHall = (s: number, o: typeof openingState) =>
  s === 1 || s === 2 || (s === 0 && o.door > 0.001) || (s === 3 && o.mainDoor > 0.001);
export const seesFrontGarden = (s: number, o: typeof openingState) => s === 3 || ((s === 1 || s === 2) && o.mainDoor > 0.001);
