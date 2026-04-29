import { useState, useEffect } from 'react'
import { etudiantService, absenceService } from '../../services/api'

export default function EditionEtudiants() {
  const [etudiants, setEtudiants] = useState([])
  const [absences, setAbsences] = useState([])
  const [selectedEtudiant, setSelectedEtudiant] = useState('')
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    etudiantService.getAll().then(r => {
      const d = r.data; setEtudiants(Array.isArray(d) ? d : d['hydra:member'] || [])
    }).catch(() => {})
  }, [])

  const handleSearch = async () => {
    if (!selectedEtudiant) return
    setLoading(true); setSearched(true)
    try {
      const r = await absenceService.getByEtudiant(selectedEtudiant)
      const d = r.data; setAbsences(Array.isArray(d) ? d : d['hydra:member'] || [])
    } catch { setAbsences([]) } finally { setLoading(false) }
  }

  const etudiant = etudiants.find(e => e.id == selectedEtudiant)
  const justifiees = absences.filter(a => a.statut === 'justifiee')
  const nonJustifiees = absences.filter(a => a.statut === 'non_justifiee')

  const filteredEtudiants = etudiants.filter(e =>
    `${e.prenom} ${e.nom}`.toLowerCase().includes(search.toLowerCase())
  )

  const statusBadge = (s) => {
    if (s === 'justifiee') return <span className="badge badge-green">Justifiée</span>
    if (s === 'non_justifiee') return <span className="badge badge-red">Non justifiée</span>
    if (s === 'en_attente') return <span className="badge badge-yellow">En attente</span>
    return <span className="badge">{s}</span>
  }

  return (
    <div>
      <div className="page-header">
        <h2>Édition — Par étudiant</h2>
        <p>Historique complet des absences d'un étudiant</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Rechercher un étudiant</label>
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input className="form-input" style={{ paddingLeft: 38 }} placeholder="Nom ou prénom..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Étudiant *</label>
            <select className="form-select" value={selectedEtudiant} onChange={e => setSelectedEtudiant(e.target.value)}>
              <option value="">Sélectionner</option>
              {filteredEtudiants.map(e => (
                <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleSearch} disabled={!selectedEtudiant}>
            Voir le rapport
          </button>
          {searched && (
            <button className="btn btn-secondary" onClick={() => window.print()}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Imprimer
            </button>
          )}
        </div>
      </div>

      {searched && etudiant && !loading && (
        <>
          {/* Fiche étudiant */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'rgba(124,90,247,0.15)', color: '#7c5af7',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.2rem',
                flexShrink: 0
              }}>
                {(etudiant.prenom || '')[0]}{(etudiant.nom || '')[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)' }}>
                  {etudiant.prenom} {etudiant.nom}
                </div>
                <div style={{ color: 'var(--text2)', fontSize: '0.85rem', marginTop: 2 }}>
                  {etudiant.email || 'Pas d\'email'} · Filière: {etudiant.filiere?.libelle || etudiant.filiere?.libelleFiliere || '—'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>{absences.length}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Total</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Syne, sans-serif', color: 'var(--success)' }}>{justifiees.length}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Justif.</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Syne, sans-serif', color: 'var(--danger)' }}>{nonJustifiees.length}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Non just.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Historique des absences</span>
            </div>

            {absences.length === 0 ? (
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/>
                </svg>
                <p>Aucune absence enregistrée pour cet étudiant</p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Matière</th>
                      <th>Enseignant</th>
                      <th>Statut</th>
                      <th>Motif</th>
                    </tr>
                  </thead>
                  <tbody>
                    {absences
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map(a => (
                        <tr key={a.id}>
                          <td>{a.date ? new Date(a.date).toLocaleDateString('fr-FR') : '—'}</td>
                          <td>{a.enseignement?.matiere?.nom || a.enseignement?.matiere?.nomMatiere || '—'}</td>
                          <td>{a.enseignement?.enseignant?.prenom} {a.enseignement?.enseignant?.nom || '—'}</td>
                          <td>{statusBadge(a.statut)}</td>
                          <td style={{ color: 'var(--text2)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {a.motif || '—'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {loading && (
        <div className="card">
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>Chargement...</div>
        </div>
      )}

      {!searched && (
        <div className="card">
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <p>Sélectionnez un étudiant pour afficher son historique</p>
          </div>
        </div>
      )}
    </div>
  )
}
