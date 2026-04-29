import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'

const modules = [
  {
    title: 'Module 1 — Paramétrage',
    color: '#4f8ef7',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 19.07l-1.41-1.41M12 2v2m0 18v2M2 12h2m18 0h2M6.34 6.34l-1.41-1.41M19.07 19.07l-1.41-1.41"/>
      </svg>
    ),
    items: [
      { label: 'Périodes d\'évaluation', to: '/periodes', desc: 'Gérer les périodes de cours' },
      { label: 'Matières', to: '/matieres', desc: 'Configurer les matières enseignées' },
      { label: 'Enseignants', to: '/enseignants', desc: 'Gérer les profils enseignants' },
      { label: 'Filières', to: '/filieres', desc: 'Organiser les filières' },
    ]
  },
  {
    title: 'Module 2 — Saisie',
    color: '#22c55e',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
    items: [
      { label: 'Inscription étudiants', to: '/etudiants', desc: 'Inscrire et gérer les étudiants' },
      { label: 'Présences & Absences', to: '/presences', desc: 'Saisir les présences par séance' },
      { label: 'Justifications', to: '/justifications', desc: 'Traiter les justifications d\'absence' },
    ]
  },
  {
    title: 'Module 3 — Éditions',
    color: '#f59e0b',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    items: [
      { label: 'Matière par filière', to: '/edition/matieres', desc: 'Rapport matières par filière' },
      { label: 'Absences par période', to: '/edition/absences', desc: 'Rapport absences filière/période' },
      { label: 'Par étudiant', to: '/edition/etudiants', desc: 'Historique par étudiant' },
    ]
  },
]

export default function Dashboard() {
  return (
    <div>
      <div className="page-header">
        <h2>Tableau de bord</h2>
        <p>Application de gestion des absences — MBDS</p>
      </div>

      <div style={{ display: 'grid', gap: 24 }}>
        {modules.map(mod => (
          <div className="card" key={mod.title}>
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 12,
                  background: `${mod.color}18`,
                  color: mod.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {mod.icon}
                </div>
                <div>
                  <div className="card-title" style={{ fontSize: '1.1rem' }}>{mod.title}</div>
                  <div style={{ color: 'var(--text2)', fontSize: '0.82rem' }}>{mod.items.length} fonctionnalités</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {mod.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  style={{
                    display: 'block',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = mod.color
                    e.currentTarget.style.background = `${mod.color}08`
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.background = 'var(--bg)'
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.88rem', marginBottom: 4 }}>
                    {item.label}
                  </div>
                  <div style={{ color: 'var(--text2)', fontSize: '0.78rem' }}>{item.desc}</div>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
