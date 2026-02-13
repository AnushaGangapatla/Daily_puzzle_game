import { useState } from "react";
import { auth, provider } from "./firebase";
import { signInWithPopup, signOut } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);
  const [number, setNumber] = useState(Math.floor(Math.random() * 10) + 1);
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const handleLogin = async () => {
    const result = await signInWithPopup(auth, provider);
    setUser(result.user);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  
  const checkGuess = () => {
  setAttempts(attempts + 1);

  if (parseInt(guess) === number) {
    setMessage("🎉 Correct! You guessed it!");
    setScore(score + 1);
    setNumber(Math.floor(Math.random() * 10) + 1);
    setGuess("");
    setAttempts(0);
  } else {
    setMessage("❌ Wrong! Try again.");
  }
};

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Daily Puzzle Game</h1>

      {!user ? (
        <button onClick={handleLogin}>Login with Google</button>
      ) : (
        <>
          <p>Welcome, {user.displayName}</p>
          <button onClick={handleLogout}>Logout</button>
          <p>Score: {score}</p>
          <p>Attempts: {attempts}</p>

          <p>Guess a number between 1 and 10</p>

          <input
            type="number"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
          />

          <button onClick={checkGuess}>Submit</button>

          <p>{message}</p>
        </>
      )}
    </div>
  );
}

export default App;
