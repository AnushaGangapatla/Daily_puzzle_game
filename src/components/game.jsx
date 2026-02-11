import { useState } from "react";

function App() {
  const [number, setNumber] = useState(
    Math.floor(Math.random() * 10) + 1
  );

  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");

  const checkGuess = () => {
    if (parseInt(guess) === number) {
      setMessage("🎉 Correct! You guessed it!");
    } else {
      setMessage("❌ Wrong! Try again.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Daily Puzzle Game</h1>

      <p>Guess a number between 1 and 10</p>

      <input
        type="number"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
      />

      <br /><br />

      <button onClick={checkGuess}>Check</button>

      <p>{message}</p>
    </div>
  );
}

export default App;

