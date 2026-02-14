import Dexie from "dexie";

export const db = new Dexie("DailyPuzzleDB");

db.version(1).stores({
  scores: "++id, value"
});
