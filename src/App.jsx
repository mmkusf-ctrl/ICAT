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
import TournamentHub from './pages/TournamentHub'
import About from './pages/About'
import TeamIcat from './pages/TeamIcat'
import Gallery from './pages/Gallery'

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/team-icat" element={<TeamIcat />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/live" element={<LiveScores />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/players" element={<Players />} />
        <Route path="/points-table" element={<PointsTablePage />} />
        <Route path="/news" element={<News />} />
        <Route path="/match/:matchId" element={<MatchDetails />} />
        <Route path="/tournament/:tournamentId" element={<TournamentHub />} />
      </Routes>
    </div>
  )
}
