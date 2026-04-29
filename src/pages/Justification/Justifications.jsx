import { useState, useEffect } from 'react'
import {
  presenceService,
  justificationService,
  etudiantService,
  filiereService,
  enseignementCreateService,
  matiereService
} from '../../services/api'
import Toast from '../../components/Toast'

const normalize = (data) => {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (data['hydra:member']) return data['hydra:member']
  if (data['member']) return data['member']
  return []
}

const idFromIri = (iri) => {
  if (!iri) return null
  if (typeof iri === 'string') return parseInt(iri.split('/').pop())
  if (typeof iri === 'object' && iri.id) return iri.id
  return null
}

export default function Justifications() {

  const [presences,  setPresences]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [selected,   setSelected]   = useState(null)   // présence sélectionnée
  const [etudiantIdx, setEtudiantIdx] = useState(0)    // index étudiant en cours
  const [motifs,     setMotifs]     = useState({})     // { etudiantId: { motif, doc } }
  const [toast,      setToast]      = useState(null)
  const [filter,     setFilter]     = useState('non_justifiee')
  const [submitting, setSubmitting] = useState(false)

  /* ══════════════════════════════════════════
     CHARGEMENT
  ══════════════════════════════════════════ */
  const load = async () => {
    setLoading(true)
    try {
      const [presRes, etudRes, filRes, ensRes, matRes, justifRes] = await Promise.all([
        presenceService.getAll(),
        etudiantService.getAll(),
        filiereService.getAll(),
        enseignementCreateService.getAll(),
        matiereService.getAll(),
        justificationService.getAll(),
      ])

      const presencesRaw   = normalize(presRes.data)
      const etudiants      = normalize(etudRes.data)
      const filieres       = normalize(filRes.data)
      const enseignements  = normalize(ensRes.data)
      const matieres       = normalize(matRes.data)
      const justifications = normalize(justifRes.data)

      const hydrated = presencesRaw.map(p => {

        const filiereId = idFromIri(p.filieres)
        const filiere   = filieres.find(f => f.id === filiereId) || null

        const ensId = idFromIri(p.enseignements)
        const ens   = enseignements.find(e => e.id === ensId) || null

        let matiere = null
        if (ens) {
          matiere = matieres.find(m =>
            (m.enseignements || []).some(e => idFromIri(e) === ensId)
          ) || null
        }

        const presentsIds    = (p.etudiants || []).map(e => idFromIri(e))
        const tousEtudiants  = etudiants.filter(e => idFromIri(e.filieres) === filiereId)
        const absents        = tousEtudiants.filter(e => !presentsIds.includes(e.id))

        const justifsDeCettePresence = justifications.filter(j =>
          idFromIri(j.presences) === p.id
        )
        const absentsJustifiesIds = justifsDeCettePresence
          .filter(j => j.statut === 'justifiee')
          .map(j => idFromIri(j.etudiants))

        const absentsNonJustifies = absents.filter(e => !absentsJustifiesIds.includes(e.id))
        const absentsJustifies    = absents.filter(e =>  absentsJustifiesIds.includes(e.id))

        return {
          ...p,
          _filiere:             filiere,
          _ens:                 ens,
          _matiere:             matiere,
          _absents:             absents,
          _absentsNonJustifies: absentsNonJustifies,
          _absentsJustifies:    absentsJustifies,
          _justifs:             justifsDeCettePresence,
        }
      })

      setPresences(hydrated.filter(p => p._absents.length > 0))
    } catch (e) {
      console.error(e)
      setPresences([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  /* ── Ouvrir le modal pour une présence ── */
  const ouvrirModal = (presence) => {
    // Initialiser un motif vide par étudiant non justifié
    const init = {}
    presence._absentsNonJustifies.forEach(e => {
      init[e.id] = { motif: '', doc: '' }
    })
    setMotifs(init)
    setEtudiantIdx(0)
    setSelected(presence)
  }

  /* ── Étudiant courant dans le stepper ── */
  const etudiantsCibles = selected ? selected._absentsNonJustifies : []
  const etudiantCourant = etudiantsCibles[etudiantIdx] || null
  const isLastEtudiant  = etudiantIdx === etudiantsCibles.length - 1
  const motifCourant    = etudiantCourant ? (motifs[etudiantCourant.id] || { motif: '', doc: '' }) : { motif: '', doc: '' }

  const setMotifCourant = (field, value) => {
    setMotifs(prev => ({
      ...prev,
      [etudiantCourant.id]: {
        ...prev[etudiantCourant.id],
        [field]: value
      }
    }))
  }

  /* ── Suivant / Soumettre ── */
  const handleSuivant = () => {
    if (!isLastEtudiant) {
      setEtudiantIdx(i => i + 1)
    }
  }

  const handleSoumettre = async () => {
    setSubmitting(true)
    try {
      await Promise.all(
        etudiantsCibles.map(etudiant => {
          const data = motifs[etudiant.id] || {}
          return justificationService.create({
            presences:            `/api/presences/${selected.id}`,
            etudiants:            `/api/etudiants/${etudiant.id}`,
            motif:                data.motif?.trim() || 'Non précisé',
            documentJustificatif: data.doc?.trim()   || null,
            statut:               'justifiee',
            dateDepot:            new Date().toISOString(),
            dateTraitement:       new Date().toISOString(),
          })
        })
      )

      setToast({ msg: `${etudiantsCibles.length} absence(s) justifiée(s)`, type: 'success' })
      setSelected(null)
      setMotifs({})
      setEtudiantIdx(0)
      load()
    } catch (e) {
      console.error(e)
      setToast({ msg: 'Erreur lors de la justification', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Filtre ── */
  const filtered = presences.filter(p => {
    if (!filter || filter === 'tous') return true
    if (filter === 'non_justifiee') return p._absentsNonJustifies.length > 0
    if (filter === 'justifiee')     return p._absentsNonJustifies.length === 0
    return true
  })

  /* ── Badge ── */
  const statusBadge = (p) => {
    const total    = p._absents.length
    const justifies = p._absentsJustifies.length
    const restants  = p._absentsNonJustifies.length

    if (restants === 0) return (
      <span style={{ background: 'rgba(34,197,94,0.12)', color: '#16a34a', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
        ✅ Tous justifiés ({total})
      </span>
    )
    if (justifies > 0) return (
      <span style={{ background: 'rgba(234,179,8,0.12)', color: '#ca8a04', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
        ⚠️ {justifies}/{total} justifiés
      </span>
    )
    return (
      <span style={{ background: 'rgba(239,68,68,0.12)', color: '#dc2626', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
        ❌ {total} non justifié(s)
      </span>
    )
  }

  const getSeanceLabel = (p) => {
    if (p._matiere) return p._matiere.nom || '—'
    if (p._ens)     return p._ens.libelle || p._ens.nom || '—'
    return '—'
  }

  const getFiliereLabel = (p) => {
    const f = p._filiere
    if (!f) return '—'
    return f.libelle || f.nom || f.code || '—'
  }

  /* ════════════════════════════════════════
     RENDU
  ════════════════════════════════════════ */
  return (
    <div>
      <div className="page-header">
        <h2>Justifications des absences</h2>
        <p>Traiter les absences étudiant par étudiant</p>
      </div>

      <div className="card">

        {/* Filtres */}
        <div className="search-bar">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { v: 'tous',          l: 'Toutes'         },
              { v: 'non_justifiee', l: 'Non justifiées' },
              { v: 'justifiee',     l: 'Justifiées'     },
            ].map(opt => (
              <button
                key={opt.v}
                className={`btn btn-sm ${filter === opt.v ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(opt.v)}
              >
                {opt.l}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'black' }}>
            Chargement...
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Absents</th>
                  <th>Date</th>
                  <th>Filière</th>
                  <th>Matière</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state"><p>Aucune absence</p></div>
                    </td>
                  </tr>
                ) : filtered.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>
                        {a._absents.length} absent(s)
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginTop: 2 }}>
                        {a._absents.map(e => `${e.prenom} ${e.nom}`).join(', ')}
                      </div>
                    </td>
                    <td>{a.date ? new Date(a.date).toLocaleDateString('fr-FR') : '—'}</td>
                    <td>{getFiliereLabel(a)}</td>
                    <td>{getSeanceLabel(a)}</td>
                    <td>{statusBadge(a)}</td>
                    <td>
                      {a._absentsNonJustifies.length > 0 && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => ouvrirModal(a)}
                        >
                          ✅ Justifier ({a._absentsNonJustifies.length})
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ════ MODAL STEPPER ════ */}
      {selected && etudiantCourant && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>

            <div className="modal-header">
              <span className="modal-title">Justification des absences</span>
              <button className="btn-icon" onClick={() => setSelected(null)}>✕</button>
            </div>

            {/* ── Stepper visuel ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
              {etudiantsCibles.map((e, i) => {
                const fait     = i < etudiantIdx
                const courant  = i === etudiantIdx
                const aMotif   = motifs[e.id]?.motif?.trim()
                return (
                  <div
                    key={e.id}
                    onClick={() => setEtudiantIdx(i)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '4px 10px', borderRadius: 20, cursor: 'pointer',
                      fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
                      background: courant
                        ? 'var(--primary)'
                        : fait && aMotif
                          ? 'rgba(34,197,94,0.15)'
                          : 'var(--bg2)',
                      color: courant
                        ? '#fff'
                        : fait && aMotif
                          ? '#16a34a'
                          : 'var(--text2)',
                      border: courant ? '2px solid var(--primary)' : '2px solid transparent',
                    }}
                  >
                    {fait && aMotif ? '✓' : i + 1}. {e.prenom} {e.nom}
                  </div>
                )
              })}
            </div>

            {/* ── Info séance ── */}
            <div style={{
              background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
              padding: '10px 14px', marginBottom: 16,
              fontSize: '0.82rem', color: 'var(--text2)',
              border: '1px solid var(--border)',
              display: 'flex', gap: 16, flexWrap: 'wrap'
            }}>
              <span>📅 {new Date(selected.date).toLocaleDateString('fr-FR')}</span>
              {selected._filiere && <span>🎓 {getFiliereLabel(selected)}</span>}
              {getSeanceLabel(selected) !== '—' && <span>📚 {getSeanceLabel(selected)}</span>}
            </div>

            {/* ── Carte étudiant courant ── */}
            <div style={{
              background: 'rgba(99,102,241,0.06)',
              border: '1.5px solid rgba(99,102,241,0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              marginBottom: 16,
            }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 2 }}>
                👤 {etudiantCourant.prenom} {etudiantCourant.nom}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>
                Étudiant {etudiantIdx + 1} sur {etudiantsCibles.length}
              </div>
            </div>

            {/* ── Formulaire ── */}
            <div className="form-group">
              <label className="form-label">Motif de justification *</label>
              <input
                className="form-input"
                placeholder="Ex: Certificat médical, urgence familiale..."
                value={motifCourant.motif}
                onChange={e => setMotifCourant('motif', e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Référence document justificatif</label>
              <input
                className="form-input"
                placeholder="N° de pièce justificative (optionnel)..."
                value={motifCourant.doc}
                onChange={e => setMotifCourant('doc', e.target.value)}
              />
            </div>

            {/* ── Résumé des motifs saisis ── */}
            {etudiantIdx > 0 && (
              <div style={{
                background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
                padding: '10px 14px', marginBottom: 16,
                fontSize: '0.8rem', border: '1px solid var(--border)'
              }}>
                <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text2)' }}>
                  Motifs déjà saisis :
                </div>
                {etudiantsCibles.slice(0, etudiantIdx).map(e => (
                  <div key={e.id} style={{ marginBottom: 3, color: 'var(--text)' }}>
                    <span style={{ fontWeight: 500 }}>{e.prenom} {e.nom}</span>
                    {' → '}
                    <span style={{ color: motifs[e.id]?.motif ? '#16a34a' : '#dc2626' }}>
                      {motifs[e.id]?.motif?.trim() || '⚠️ Pas de motif'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-footer">
              {etudiantIdx > 0 && (
                <button
                  className="btn btn-secondary"
                  onClick={() => setEtudiantIdx(i => i - 1)}
                >
                  ← Précédent
                </button>
              )}
              <button
                className="btn btn-secondary"
                onClick={() => setSelected(null)}
              >
                Annuler
              </button>

              {!isLastEtudiant ? (
                <button
                  className="btn btn-primary"
                  onClick={handleSuivant}
                  disabled={!motifCourant.motif.trim()}
                >
                  Suivant → ({etudiantIdx + 2}/{etudiantsCibles.length})
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={handleSoumettre}
                  disabled={!motifCourant.motif.trim() || submitting}
                >
                  {submitting
                    ? 'Enregistrement...'
                    : `✅ Valider tout (${etudiantsCibles.length})`}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {toast && (
        <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}