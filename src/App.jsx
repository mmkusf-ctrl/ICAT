import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import LiveScores from './pages/LiveScores'
import Schedule from './pages/Schedule'
import Teams from './pages/Teams'
import Players from './pages/Players'
import PointsTablePage from './pages/PointsTablePage'
import News from './pages/News'
import MatchDetails from './pages/MatchDetails'

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/live" element={<LiveScores />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/players" element={<Players />} />
        <Route path="/points-table" element={<PointsTablePage />} />
        <Route path="/news" element={<News />} />
        <Route path="/match/:matchId" element={<MatchDetails />} />
      </Routes>
    </div>
  )
}
