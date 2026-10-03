import type { openingState } from "./bedroomState";

// Visibility rules for each part of the home (spaces: 0 bedroom, 1 hall,
// 2 deck, 3 front garden, 4 bathroom, 5 kitchen, 6 stair tower). A door
// counts as a view as soon as it starts opening, so nothing pops in while
// it swings.
export const seesBedroom = (s: number, o: typeof openingState) => s === 0 || ((s === 1 || s === 2) && o.door > 0.001);
export const seesHall = (s: number, o: typeof openingState) =>
  s === 1 ||
  s === 2 ||
  (s === 0 && o.door > 0.001) ||
  (s === 3 && o.mainDoor > 0.001) ||
  (s === 4 && o.bathDoor > 0.001) ||
  s === 5 ||
  s === 6;

export const seesBathroom = (s: number, o: typeof openingState) => s === 4 || (s === 1 && o.bathDoor > 0.001);

/** The kitchen is open to the hall, so each can always see the other. */
export const seesKitchen = (s: number) => s === 5 || s === 1;
/** The stair tower is open to the hall through a plain cased doorway. */
export const seesStairHall = (s: number) => s === 6 || s === 1;
/** The whole first floor (and the stair tower leading to it) is one zone,
 * rendered together and hidden while the viewer is down on the ground floor. */
export const seesFirstFloor = (s: number) => s >= 6;
export const seesFrontGarden = (s: number, o: typeof openingState) => s === 3 || ((s === 1 || s === 2) && o.mainDoor > 0.001);
