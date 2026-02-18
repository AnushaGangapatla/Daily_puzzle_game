import { useState, useEffect } from "react";
import { auth, provider } from "./firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { db } from "./db";
import dayjs from "dayjs";
import { lazy, Suspense } from "react";

const HeatmapContainer = lazy(() =>
  import("./components/heatmap/HeatmapContainer")
);


function App() {
  const [user, setUser] = useState(null);
  const [number, setNumber] = useState(Math.floor(Math.random() * 10) + 1);
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [highScore, setHighScore] = useState(0);


  useEffect(() => {
    const loadHighScore = async () => {
      const saved = await db.scores.orderBy("value").last();
      if (saved) {
        setHighScore(saved.value);
      }
    };

    loadHighScore();
  }, []);

  const handleLogin = async () => {
    const result = await signInWithPopup(auth, provider);
    setUser(result.user);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const checkGuess = async () => {
    if (!guess || isNaN(guess)) {
      setMessage("Please enter a valid number.");
      return;
    }
    if (guess < 1 || guess > 10) {
      setMessage("Number must be between 1 and 10.");
      return;
    }

    if (parseInt(guess) === number) {
      const newScore = score + 1;

      setMessage("🎉 Correct! You guessed it!");
      setScore(newScore);

      // 🔥 Update High Score in IndexedDB
      if (newScore > highScore) {
        setHighScore(newScore);
        await db.scores.add({ value: newScore });
      }

      // 🔥 Save Daily Activity
      const today = dayjs().format("YYYY-MM-DD");

      await db.dailyActivity.put({
        date: today,
        solved: true,
        score: newScore,
        timeTaken: 30,
        difficulty: 1,
        synced: false
      });

      // 🔥 Batch Sync Trigger Rule (Every 5 puzzles)
      const unsyncedCount = await db.dailyActivity
      .where("synced")
      .equals(false)
      .count();
      if (unsyncedCount >= 5) {
        console.log("Trigger batch sync (future backend)");
      }


      setNumber(Math.floor(Math.random() * 10) + 1);
      setGuess("");
      setAttempts(0);

    } else {
      setMessage("❌ Wrong! Try again.");
      setAttempts(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96 text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          🎯 Daily Puzzle Game
        </h1>

        {!user ? (
          <button
            onClick={handleLogin}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login with Google
          </button>
        ) : (
          <>
            <p className="mb-2 font-medium">
              Welcome, {user.displayName}
            </p>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded-md mb-4 hover:bg-red-600 transition"
            >
              Logout
            </button>

            <p className="font-semibold">Score: {score}</p>
            <p className="font-semibold">High Score: {highScore}</p>
            <p className="mb-3">Attempts: {attempts}</p>

            <p className="mb-2">
              Guess a number between 1 and 10
            </p>

            <input
              type="number"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              className="border rounded-md px-3 py-2 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              onClick={checkGuess}
              className="bg-green-500 text-white px-4 py-2 rounded-lg w-full hover:bg-green-600 transition"
            >
              Submit
            </button>

            <p className="mt-4 font-medium">{message}</p>

            {/* 🔥 Heatmap Section */}
            <h2 className="mt-6 font-bold">Your Activity</h2>
            <Suspense fallback={<div>Loading activity...</div>}>
              <HeatmapContainer />
            </Suspense>

          </>
        )}
      </div>
    </div>
  );
}

export default App;
