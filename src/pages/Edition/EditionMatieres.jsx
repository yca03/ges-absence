import { useEffect, useState } from 'react'
import { matiereService, filiereService } from '../../services/api'
import './EditionMatieres.css'

export default function EditionMatieres() {
  const [matieres, setMatieres] = useState([])
  const [filieres, setFilieres] = useState([])
  const [selectedFiliere, setSelectedFiliere] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([matiereService.getAll(), filiereService.getAll()])
      .then(([mRes, fRes]) => {
        setMatieres(mRes.data?.member || [])
        setFilieres(fRes.data?.member || [])
      })
      .finally(() => setLoading(false))
  }, [])

  // Résoudre le nom d'une filière depuis son IRI ex: "/api/filieres/1"
  const getFiliereNameByIri = (iri) => {
    const id = iri?.toString().split('/').pop()
    const found = filieres.find(f => f.id?.toString() === id)
    return found?.nom || found?.libelle || iri
  }

  // Filtrer les matières par filière sélectionnée
  const filtered = selectedFiliere
    ? matieres.filter(m =>
        Array.isArray(m.filieres) &&
        m.filieres.some(f => f.toString().includes(`/filieres/${selectedFiliere}`))
      )
    : matieres

  return (
    <div className="edition-page">
      <div className="edition-header">
        <div>
          <h2 className="edition-title">Matières par filière</h2>
          <p className="edition-subtitle">{filtered.length} matière(s) trouvée(s)</p>
        </div>
        <div className="edition-filters">
          <select
            value={selectedFiliere}
            onChange={e => setSelectedFiliere(e.target.value)}
            className="edition-select"
          >
            <option value="">Toutes les filières</option>
            {filieres.map(f => (
              <option key={f.id} value={f.id}>{f.nom || f.libelle}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="mat-loading">Chargement...</div>
      ) : (
        <div className="mat-table-wrapper">
          <table className="mat-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Matière</th>
                <th>Filières</th>
                <th>Coefficient</th>
                <th>Volume horaire</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="mat-empty">Aucune matière trouvée</td></tr>
              ) : (
                filtered.map((m, i) => (
                  <tr key={m.id}>
                    <td className="mat-num">{i + 1}</td>
                    <td className="mat-name">{m.nom || '—'}</td>

                    {/* FILIÈRES */}
                    <td>
                      {Array.isArray(m.filieres) && m.filieres.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {m.filieres.map((iri, idx) => (
                            <span key={idx} className="mat-badge">
                              {getFiliereNameByIri(iri)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>—</span>
                      )}
                    </td>

                    <td className="mat-center">{m.coefficient ?? '—'}</td>
                    <td className="mat-center">{m.volumeHoraire ?? '—'} h</td>
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