import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="brand">ICAT LIVE</div>
      <nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/live">Live</NavLink>
        <NavLink to="/schedule">Schedule</NavLink>
        <NavLink to="/points-table">Points Table</NavLink>
        <NavLink to="/players">Players</NavLink>
        <NavLink to="/teams">Teams</NavLink>
        <NavLink to="/news">News</NavLink>
      </nav>
    </header>
  )
}
