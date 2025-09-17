import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import Register from './components/Register'
import Verify from './components/Verify'
import Voting from './components/Voting'
import Results from './components/Results'
import ReceiptVerification from './components/ReceiptVerification'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/voting" element={<Voting />} />
          <Route path="/results" element={<Results />} />
          <Route path="/receipt" element={<ReceiptVerification />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
