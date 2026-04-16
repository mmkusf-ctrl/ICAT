import { NavLink } from 'react-router-dom'
import logo from '../assets/logo.svg'

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="brand">
        <NavLink to="/">
          <img src={logo} alt="ICAT Logo" className="logo-img" />
        </NavLink>
      </div>
      <nav>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/team-icat">Team ICAT</NavLink>
        <NavLink to="/gallery">Gallery</NavLink>
        <NavLink to="/news">News</NavLink>
        <NavLink to="/broadcast" style={{ color: 'var(--accent-red)' }}><i className="fa-solid fa-tower-broadcast"></i> CAPTAIN'S STUDIO</NavLink>
      </nav>
    </header>
  )
}
