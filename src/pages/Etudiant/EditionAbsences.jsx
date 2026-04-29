import { useState, useEffect } from 'react'
import { filiereService, periodeService, absenceService } from '../../services/api'

export default function EditionAbsences() {
  const [filieres, setFilieres] = useState([])
  const [periodes, setPeriodes] = useState([])
  const [absences, setAbsences] = useState([])
  const [selectedFiliere, setSelectedFiliere] = useState('')
  const [selectedPeriode, setSelectedPeriode] = useState('')
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    filiereService.getAll().then(r => {
      const d = r.data; setFilieres(Array.isArray(d) ? d : d['hydra:member'] || [])
    }).catch(() => {})
    periodeService.getAll().then(r => {
      const d = r.data; setPeriodes(Array.isArray(d) ? d : d['hydra:member'] || [])
    }).catch(() => {})
  }, [])

  const handleSearch = async () => {
    setLoading(true); setSearched(true)
    try {
      const r = await absenceService.getByFiliere(selectedFiliere, selectedPeriode)
      const d = r.data; setAbsences(Array.isArray(d) ? d : d['hydra:member'] || [])
    } catch { setAbsences([]) } finally { setLoading(false) }
  }

  // Grouper par étudiant
  const byEtudiant = {}
  absences.forEach(a => {
    const key = a.etudiant?.id || 'inconnu'
    if (!byEtudiant[key]) byEtudiant[key] = { etudiant: a.etudiant, absences: [] }
    byEtudiant[key].absences.push(a)
  })

  const justCount = (list) => list.filter(a => a.statut === 'justifiee').length
  const nonJustCount = (list) => list.filter(a => a.statut === 'non_justifiee').length

  const filiereName = filieres.find(f => f.id == selectedFiliere)
  const periodeName = periodes.find(p => p.id == selectedPeriode)

  return (
    <div>
      <div className="page-header">
        <h2>Édition — Absences par filière et période</h2>
        <p>Rapport des absences filtrées par filière et période d'évaluation</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Filière *</label>
            <select className="form-select" value={selectedFiliere} onChange={e => setSelectedFiliere(e.target.value)}>
              <option value="">Sélectionner une filière</option>
              {filieres.map(f => <option key={f.id} value={f.id}>{f.libelle || f.libelleFiliere}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Période</label>
            <select className="form-select" value={selectedPeriode} onChange={e => setSelectedPeriode(e.target.value)}>
              <option value="">Toutes les périodes</option>
              {periodes.map(p => <option key={p.id} value={p.id}>{p.libelle}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleSearch} disabled={!selectedFiliere}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Générer le rapport
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

      {searched && !loading && (
        <>
          {/* Résumé */}
          <div className="stats-grid" style={{ marginBottom: 20 }}>
            <div className="stat-card">
              <div className="stat-label">Étudiants concernés</div>
              <div className="stat-value">{Object.keys(byEtudiant).length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total absences</div>
              <div className="stat-value">{absences.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Justifiées</div>
              <div className="stat-value" style={{ color: 'var(--success)' }}>{absences.filter(a => a.statut === 'justifiee').length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Non justifiées</div>
              <div className="stat-value" style={{ color: 'var(--danger)' }}>{absences.filter(a => a.statut === 'non_justifiee').length}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">
                {filiereName ? (filiereName.libelle || filiereName.libelleFiliere) : ''} 
                {periodeName ? ` — ${periodeName.libelle}` : ''}
              </span>
            </div>

            {Object.keys(byEtudiant).length === 0 ? (
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/>
                </svg>
                <p>Aucune absence enregistrée pour cette sélection</p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Étudiant</th>
                      <th>Nb. absences total</th>
                      <th>Justifiées</th>
                      <th>Non justifiées</th>
                      <th>Taux</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(byEtudiant).map((row, i) => {
                      const total = row.absences.length
                      const just = justCount(row.absences)
                      const nonJust = nonJustCount(row.absences)
                      const taux = total > 0 ? Math.round((nonJust / total) * 100) : 0
                      return (
                        <tr key={i}>
                          <td>{row.etudiant?.prenom} {row.etudiant?.nom}</td>
                          <td><span className="badge badge-blue">{total}</span></td>
                          <td><span className="badge badge-green">{just}</span></td>
                          <td><span className="badge badge-red">{nonJust}</span></td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ flex: 1, height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ width: `${taux}%`, height: '100%', background: taux > 50 ? 'var(--danger)' : taux > 25 ? 'var(--warning)' : 'var(--success)', borderRadius: 3, transition: 'width 0.3s' }} />
                              </div>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text2)', minWidth: 30 }}>{taux}%</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {loading && (
        <div className="card">
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>Génération du rapport...</div>
        </div>
      )}

      {!searched && (
        <div className="card">
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <p>Sélectionnez une filière puis cliquez sur "Générer le rapport"</p>
          </div>
        </div>
      )}
    </div>
  )
}
