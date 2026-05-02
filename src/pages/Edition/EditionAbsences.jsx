import { useEffect, useState } from 'react'
import { presenceService, filiereService, periodeService } from '../../services/api'
import './EditionAbsences.css'

export default function EditionAbsences() {
  const [presences, setPresences] = useState([])
  const [filieres, setFilieres] = useState([])
  const [periodes, setPeriodes] = useState([])
  const [selectedFiliere, setSelectedFiliere] = useState('')
  const [selectedPeriode, setSelectedPeriode] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      presenceService.getAll(),
      filiereService.getAll(),
      periodeService.getAll()
    ]).then(([pRes, fRes, perRes]) => {
      setPresences(pRes.data?.member || [])
      setFilieres(fRes.data?.member || [])
      setPeriodes(perRes.data?.member || [])
    }).finally(() => setLoading(false))
  }, [])

  const absences = presences.filter(p =>
    p.statut === 'absent' || p.statut === 'ABSENT' || p.statut === false
  )

  const filtered = absences.filter(p => {
    const matchFiliere = selectedFiliere
      ? p.etudiant?.filiere?.toString().includes(`/${selectedFiliere}`)
      : true
    const matchPeriode = selectedPeriode
      ? p.periode?.toString().includes(`/${selectedPeriode}`)
      : true
    return matchFiliere && matchPeriode
  })

  return (
    <div className="abs-page">
      <div className="abs-header">
        <div>
          <h2 className="abs-title">Absences par filière et par période</h2>
          <p className="abs-subtitle">{filtered.length} absence(s) trouvée(s)</p>
        </div>
        <div className="abs-filters">
          <select value={selectedFiliere} onChange={e => setSelectedFiliere(e.target.value)} className="abs-select">
            <option value="">Toutes les filières</option>
            {filieres.map(f => (
              <option key={f.id} value={f.id}>{f.nom || f.libelle}</option>
            ))}
          </select>
          <select value={selectedPeriode} onChange={e => setSelectedPeriode(e.target.value)} className="abs-select">
            <option value="">Toutes les périodes</option>
            {periodes.map(p => (
              <option key={p.id} value={p.id}>{p.nom || p.libelle || p.datePeriode}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="abs-loading">Chargement...</div>
      ) : (
        <div className="abs-table-wrapper">
          <table className="abs-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Étudiant</th>
                <th>Matière</th>
                <th>Date</th>
                <th>Période</th>
                <th>Justifié</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="abs-empty">Aucune absence trouvée</td></tr>
              ) : (
                filtered.map((p, i) => (
                  <tr key={p.id}>
                    <td className="abs-num">{i + 1}</td>
                    <td className="abs-name">
                      {p.etudiant?.nom || p.etudiant?.prenom
                        ? `${p.etudiant.nom ?? ''} ${p.etudiant.prenom ?? ''}`.trim()
                        : '—'}
                    </td>
                    <td>{p.enseignement?.matiere?.nom || p.matiere?.nom || '—'}</td>
                    <td>{p.dateValidation || p.date || '—'}</td>
                    <td>{p.periode?.nom || p.periode?.libelle || '—'}</td>
                    <td>
                      <span className={`abs-status ${p.justifie || p.justification ? 'abs-ok' : 'abs-non'}`}>
                        {p.justifie || p.justification ? 'Oui' : 'Non'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}