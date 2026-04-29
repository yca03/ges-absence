import { useState, useEffect } from 'react'
import { filiereService, matiereService, enseignementService } from '../services/api'

export default function EditionMatieres() {
  const [filieres, setFilieres] = useState([])
  const [matieres, setMatieres] = useState([])
  const [enseignements, setEnseignements] = useState([])
  const [selectedFiliere, setSelectedFiliere] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    filiereService.getAll().then(r => {
      const d = r.data
      setFilieres(Array.isArray(d) ? d : d['hydra:member'] || [])
    }).catch(() => {})

    matiereService.getAll().then(r => {
      const d = r.data
      setMatieres(Array.isArray(d) ? d : d['hydra:member'] || [])
    }).catch(() => {})

    enseignementService.getAll().then(r => {
      const d = r.data
      setEnseignements(Array.isArray(d) ? d : d['hydra:member'] || [])
    }).catch(() => {})
  }, [])

  const handlePrint = () => window.print()

  // Filtrer les enseignements par filière sélectionnée
  const filteredEns = enseignements.filter(e => {
    if (!selectedFiliere) return true
    return (e.filiere?.id || e.filiereId) == selectedFiliere
  })

  // Grouper par matière
  const grouped = {}
  filteredEns.forEach(e => {
    const key = e.matiere?.id || e.matiereId || 'sans'
    if (!grouped[key]) grouped[key] = { matiere: e.matiere, enseignements: [] }
    grouped[key].enseignements.push(e)
  })

  const filiereName = filieres.find(f => f.id == selectedFiliere)

  return (
    <div>
      <div className="page-header">
        <h2>Édition — Matières par filière</h2>
        <p>Rapport des matières enseignées par filière</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Filière</label>
            <select className="form-select" value={selectedFiliere} onChange={e => setSelectedFiliere(e.target.value)}>
              <option value="">Toutes les filières</option>
              {filieres.map(f => <option key={f.id} value={f.id}>{f.libelle || f.libelleFiliere}</option>)}
            </select>
          </div>
          <button className="btn btn-secondary" onClick={handlePrint}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Imprimer
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">
            {filiereName ? `Matières — ${filiereName.libelle || filiereName.libelleFiliere}` : 'Toutes les matières'}
          </span>
          <span className="badge badge-blue">{Object.keys(grouped).length} matière(s)</span>
        </div>

        {Object.keys(grouped).length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <p>Aucun enseignement trouvé pour cette sélection</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16, marginTop: 8 }}>
            {Object.values(grouped).map((g, i) => (
              <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', background: 'var(--bg)', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)' }}>
                  <span className="badge badge-blue">{g.matiere?.code || '—'}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>{g.matiere?.nom || g.matiere?.nomMatiere || 'Matière inconnue'}</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--text2)', fontSize: '0.82rem' }}>{g.enseignements.length} séance(s)</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '8px 16px', textAlign: 'left', fontSize: '0.72rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Enseignant</th>
                      <th style={{ padding: '8px 16px', textAlign: 'left', fontSize: '0.72rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Date</th>
                      <th style={{ padding: '8px 16px', textAlign: 'left', fontSize: '0.72rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Horaire</th>
                      <th style={{ padding: '8px 16px', textAlign: 'left', fontSize: '0.72rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Filière</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.enseignements.map(e => (
                      <tr key={e.id} style={{ borderTop: '1px solid rgba(42,48,64,0.5)' }}>
                        <td style={{ padding: '10px 16px', fontSize: '0.85rem', color: 'var(--text2)' }}>
                          {e.enseignant?.prenom} {e.enseignant?.nom || '—'}
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: '0.85rem', color: 'var(--text2)' }}>
                          {e.dateEnseignement ? new Date(e.dateEnseignement).toLocaleDateString('fr-FR') : '—'}
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: '0.85rem', color: 'var(--text2)' }}>{e.horaire || '—'}</td>
                        <td style={{ padding: '10px 16px', fontSize: '0.85rem', color: 'var(--text2)' }}>
                          {e.filiere?.libelle || e.filiere?.libelleFiliere || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
