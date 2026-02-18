import Dexie from "dexie";

export const db = new Dexie("DailyPuzzleDB");

db.version(2).stores({
  scores: "++id, value",
  dailyActivity: "date, solved, score, timeTaken, difficulty, synced"
});
