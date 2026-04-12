import { NavLink } from 'react-router-dom'
import logo from '../assets/logo.svg'

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="brand">
        <img src={logo} alt="ICAT Logo" className="logo-img" />
      </div>
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
