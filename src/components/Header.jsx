import { NavLink, useLocation } from 'react-router-dom'
import   './Header.css'
import { useState, useRef, useEffect } from 'react'

export default function Header() {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  return (
    <header className="header">

      {/* LEFT : TITRE + SEARCH */}
      <div className="header-left">
        <h1 className="header-title">Gestion d'absences</h1>

        <div className="search-box">
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input placeholder="Rechercher..." />
        </div>
      </div>

      {/* RIGHT */}
      <div className="header-right" ref={ref}>

        {/* Notification */}
        <div className="notif">
          <svg viewBox="0 0 24 24">
            <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7"/>
            <path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          <span className="notif-badge">3</span>
        </div>

        {/* Profil */}
        <div className="profile" onClick={() => setOpen(!open)}>
          <div className="avatar">CA</div>
          <div className="info">
            <span className="name">Chris</span>
            <span className="role">Admin</span>
          </div>
        </div>

        {/* Dropdown */}
        {open && (
          <div className="dropdown">
            <button className="dropdown-item">Mon profil</button>
            <button className="dropdown-item">Paramètres</button>
            <div className="dropdown-divider"></div>
            <button className="dropdown-item danger" onClick={handleLogout}>
              Se déconnecter
            </button>
          </div>
        )}
      </div>
    </header>
  )
}