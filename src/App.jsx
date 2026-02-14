import { useState } from "react";
import { auth, provider } from "./firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { db } from "./db";
import { useEffect } from "react";


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

  const checkGuess = () => {
    setScore((prev) => {
  const newScore = prev + 1;

  if (newScore > highScore) {
    setHighScore(newScore);
    localStorage.setItem("highScore", newScore);
  }

  return newScore;
});

    if (parseInt(guess) === number) {
      setMessage("🎉 Correct! You guessed it!");
      setScore(prev => prev + 1);
      setNumber(Math.floor(Math.random() * 10) + 1);
      setGuess("");
      setAttempts(0);
    } else {
      setMessage("❌ Wrong! Try again.");
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
            <p className="mb-2 font-medium">Welcome, {user.displayName}</p>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded-md mb-4 hover:bg-red-600 transition"
            >
              Logout
            </button>

            <p className="font-semibold">Score: {score}</p>
            <p className="font-semibold">High Score: {highScore}</p>
            <p className="mb-3">Attempts: {attempts}</p>

            <p className="mb-2">Guess a number between 1 and 10</p>

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
          </>
        )}
      </div>
    </div>
  );
}

export default App;