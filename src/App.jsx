import { Routes, Route } from "react-router-dom"
import Game from "./components/Game"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Game />} />
    </Routes>
  )
}

export default App
