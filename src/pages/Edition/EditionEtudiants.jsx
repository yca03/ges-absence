import { useEffect, useState } from 'react'
import { etudiantService, presenceService } from '../../services/api'
import './EditionEtudiants.css'

export default function EditionEtudiants() {
  const [etudiants, setEtudiants] = useState([])
  const [presences, setPresences] = useState([])
  const [selectedEtudiant, setSelectedEtudiant] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([etudiantService.getAll(), presenceService.getAll()])
      .then(([eRes, pRes]) => {
        setEtudiants(eRes.data?.member || [])
        setPresences(pRes.data?.member || [])
      })
      .finally(() => setLoading(false))
  }, [])

  const etudiant = etudiants.find(e => e.id?.toString() === selectedEtudiant)

  const presencesEtudiant = selectedEtudiant
    ? presences.filter(p => {
        const eId = p.etudiant?.['@id'] || p.etudiant
        return eId?.toString().includes(`/${selectedEtudiant}`)
      })
    : []

  const absences = presencesEtudiant.filter(p =>
    p.statut === 'absent' || p.statut === 'ABSENT' || p.statut === false
  )
  const justifiees = absences.filter(p => p.justifie || p.justification)
  const nonJustifiees = absences.filter(p => !p.justifie && !p.justification)

  return (
    <div className="etud-page">
      <div className="etud-header">
        <div>
          <h2 className="etud-title">Absences par étudiant</h2>
          <p className="etud-subtitle">Fiche individuelle de présence</p>
        </div>
        <select
          value={selectedEtudiant}
          onChange={e => setSelectedEtudiant(e.target.value)}
          className="etud-select"
        >
          <option value="">Sélectionner un étudiant</option>
          {etudiants.map(e => (
            <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="etud-loading">Chargement...</div>
      ) : !selectedEtudiant ? (
        <div className="etud-empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#bfdbfe" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <p>Sélectionnez un étudiant pour voir sa fiche</p>
        </div>
      ) : (
        <>
          {etudiant && (
            <div className="etud-fiche">
              <div className="etud-avatar">
                {etudiant.nom?.[0]}{etudiant.prenom?.[0]}
              </div>
              <div className="etud-info">
                <h3>{etudiant.nom} {etudiant.prenom}</h3>
                <p>{etudiant.email || etudiant.matricule || '—'}</p>
              </div>
              <div className="etud-stats">
                <div className="etud-stat">
                  <span className="etud-stat-num">{presencesEtudiant.length}</span>
                  <span className="etud-stat-label">Séances</span>
                </div>
                <div className="etud-stat red">
                  <span className="etud-stat-num">{absences.length}</span>
                  <span className="etud-stat-label">Absences</span>
                </div>
                <div className="etud-stat green">
                  <span className="etud-stat-num">{justifiees.length}</span>
                  <span className="etud-stat-label">Justifiées</span>
                </div>
                <div className="etud-stat orange">
                  <span className="etud-stat-num">{nonJustifiees.length}</span>
                  <span className="etud-stat-label">Non justifiées</span>
                </div>
              </div>
            </div>
          )}

          <div className="etud-table-wrapper">
            <table className="etud-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Matière</th>
                  <th>Statut</th>
                  <th>Justifié</th>
                </tr>
              </thead>
              <tbody>
                {presencesEtudiant.length === 0 ? (
                  <tr><td colSpan={5} className="etud-empty">Aucune donnée pour cet étudiant</td></tr>
                ) : (
                  presencesEtudiant.map((p, i) => {
                    const isAbsent = p.statut === 'absent' || p.statut === 'ABSENT' || p.statut === false
                    return (
                      <tr key={p.id}>
                        <td className="etud-num">{i + 1}</td>
                        <td>{p.dateValidation || p.date || '—'}</td>
                        <td>{p.enseignement?.matiere?.nom || p.matiere?.nom || '—'}</td>
                        <td>
                          <span className={`etud-status ${isAbsent ? 'etud-non' : 'etud-ok'}`}>
                            {isAbsent ? 'Absent' : 'Présent'}
                          </span>
                        </td>
                        <td>
                          {isAbsent ? (
                            <span className={`etud-status ${p.justifie || p.justification ? 'etud-ok' : 'etud-non'}`}>
                              {p.justifie || p.justification ? 'Oui' : 'Non'}
                            </span>
                          ) : '—'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}