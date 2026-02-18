import { useState, useEffect, lazy, Suspense } from "react";
import { auth, provider } from "./firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { db } from "./db";
import dayjs from "dayjs";
import SHA256 from "crypto-js/sha256";


// Lazy load heatmap for performance
const HeatmapContainer = lazy(() =>
  import("./components/Heatmap/HeatmapContainer")
);
const SECRET_KEY = "daily-puzzle-secret";

function generateDailyNumber() {
  const today = new Date().toISOString().split("T")[0];
  const hash = SHA256(today + SECRET_KEY).toString();

  // Convert first few characters of hash to number 1–10
  const number = (parseInt(hash.substring(0, 8), 16) % 10) + 1;

  return number;
}


function App() {
  const [user, setUser] = useState(null);
  const [number, setNumber] = useState(generateDailyNumber());
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [startTime, setStartTime] = useState(null);

  // 🔥 Listen to auth state (persists login offline)
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Load high score from IndexedDB
  useEffect(() => {
    const loadHighScore = async () => {
      const saved = await db.scores.orderBy("value").last();
      if (saved) {
        setHighScore(saved.value);
      }
    };

    loadHighScore();
  }, []);

  // Google Login
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.log("Login failed (probably offline)");
    }
  };

  // Guest Mode (works offline)
  const handleGuest = () => {
    setUser({ displayName: "Guest User" });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.log("Logout error");
    }
    setUser(null);
  };

  const checkGuess = async () => {
    const today = new Date().toISOString().split("T")[0];
    const existing = await db.dailyActivity.get(today);
    if (existing?.solved) {
      setMessage("You already completed today's puzzle!");
      return;
    }

    // 🔐 Input validation
    if (!guess || isNaN(guess)) {
      setMessage("Please enter a valid number.");
      return;
    }

    if (guess < 1 || guess > 10) {
      setMessage("Number must be between 1 and 10.");
      return;
    }

    setAttempts((prev) => prev + 1);

    if (!startTime) {
      setStartTime(Date.now());
    }

    if (parseInt(guess) === number) {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);

      const newScore = score + 1;
      setScore(newScore);

      setMessage("🎉 Correct! You guessed it!");

      // Save high score
      if (newScore > highScore) {
        setHighScore(newScore);
        await db.scores.put({
          date: dayjs().format("YYYY-MM-DD"),
          value: newScore,
        });
      }

      // Save daily activity to IndexedDB
      const today = dayjs().format("YYYY-MM-DD");

      await db.dailyActivity.put({
        date: today,
        solved: true,
        score: newScore,
        timeTaken,
        difficulty: 1,
        synced: false,
      });

      // 🔥 Batch sync rule (every 5 unsynced)
      const unsyncedCount = await db.dailyActivity
        .where("synced")
        .equals(false)
        .count();

      if (unsyncedCount >= 5) {
        console.log("Trigger batch sync (future backend)");
      }

      // Reset game
      setNumber(Math.floor(Math.random() * 10) + 1);
      setGuess("");
      setAttempts(0);
      setStartTime(null);
    } else {
      setMessage("❌ Wrong! Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center transition-all duration-300">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          🎯 Daily Puzzle Game
        </h1>

        {!user ? (
          <>
            <button
              onClick={handleLogin}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full mb-3"
            >
              Login with Google
            </button>

            <button
              onClick={handleGuest}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition w-full"
            >
              Continue as Guest
            </button>
          </>
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
            <p className="font-semibold">
              High Score: {highScore}
            </p>
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

            <h2 className="mt-6 font-bold">Your Activity</h2>

            <Suspense
              fallback={<div>Loading activity...</div>}
            >
              <HeatmapContainer />
            </Suspense>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
