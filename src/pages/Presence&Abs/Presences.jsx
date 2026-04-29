import { useState, useEffect } from 'react'
import {
  enseignementCreateService,
  enseignantService,
  etudiantService,
  filiereService,
  matiereService,
  presenceService
} from '../../services/api'
import Toast from '../../components/Toast'
import ConfirmDialog from '../../components/ConfirmDialog'

const idFromIri = (iri) => {
  if (!iri) return null
  if (typeof iri === 'string') return parseInt(iri.split('/').pop())
  if (typeof iri === 'object' && iri.id) return iri.id
  return null
}

const normalize = (data) => {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (data['hydra:member']) return data['hydra:member']
  if (data['member']) return data['member']
  return []
}

const TAB_SAISIE = 'saisie'
const TAB_LISTE  = 'liste'

export default function Presences() {

  const [tab, setTab] = useState(TAB_SAISIE)

  /* ── Référentiels ── */
  const [enseignements, setEnseignements] = useState([])
  const [enseignants,   setEnseignants]   = useState([])
  const [filieres,      setFilieres]      = useState([])
  const [etudiants,     setEtudiants]     = useState([])
  const [matieres,      setMatieres]      = useState([])

  /* ── Saisie ── */
  const [selectedEns,     setSelectedEns]     = useState('')
  const [selectedFiliere, setSelectedFiliere] = useState('')
  const [autoEnseignant,  setAutoEnseignant]  = useState(null)
  const [presenceMap,     setPresenceMap]     = useState({})
  const [etudiantsFil,    setEtudiantsFil]    = useState([])
  const [saving,          setSaving]          = useState(false)
  const [date,            setDate]            = useState(new Date().toISOString().split('T')[0])

  /* ── Liste ── */
  const [presences,    setPresences]    = useState([])
  const [loadingList,  setLoadingList]  = useState(false)
  const [confirm,      setConfirm]      = useState(null)
  const [editPresence, setEditPresence] = useState(null)
  const [editMap,      setEditMap]      = useState({})
  const [editEtudiants, setEditEtudiants] = useState([])

  const [toast, setToast] = useState(null)

  /* ════════════ CHARGEMENT INITIAL ════════════ */
  useEffect(() => {
    Promise.all([
      enseignementCreateService.getAll(),
      filiereService.getAll(),
      enseignantService.getAll(),
      matiereService.getAll(),
      etudiantService.getAll(),
    ]).then(([ensRes, filRes, ensantRes, matRes, etudRes]) => {
      setEnseignements(normalize(ensRes.data))
      setFilieres(normalize(filRes.data))
      setEnseignants(normalize(ensantRes.data))
      setMatieres(normalize(matRes.data))
      setEtudiants(normalize(etudRes.data))
    }).catch(console.error)
  }, [])

  useEffect(() => {
    if (tab === TAB_LISTE) loadPresences()
  }, [tab])

  const loadPresences = async () => {
    setLoadingList(true)
    try {
      const r = await presenceService.getAll()
      setPresences(normalize(r.data))
    } catch (e) {
      console.error(e)
      setToast({ msg: 'Erreur chargement présences', type: 'error' })
    } finally {
      setLoadingList(false)
    }
  }

  /* ════════════ SAISIE ════════════ */

  /* Filière → étudiants */
  useEffect(() => {
    if (!selectedFiliere) { setEtudiantsFil([]); setPresenceMap({}); return }
    const filtered = etudiants.filter(e =>
      String(idFromIri(e.filieres)) === String(selectedFiliere)
    )
    setEtudiantsFil(filtered)
    const map = {}
    filtered.forEach(e => { map[e.id] = 'present' })
    setPresenceMap(map)
  }, [selectedFiliere, etudiants])

  /* Séance → enseignant auto */
  useEffect(() => {
    if (!selectedEns) { setAutoEnseignant(null); return }
    const seance = enseignements.find(e => String(e.id) === String(selectedEns))
    if (!seance) { setAutoEnseignant(null); return }
    const iriOrObj = seance.enseigants
    if (!iriOrObj) { setAutoEnseignant(null); return }
    if (typeof iriOrObj === 'object' && iriOrObj.nom) {
      setAutoEnseignant(iriOrObj)
    } else {
      const id = idFromIri(iriOrObj)
      setAutoEnseignant(enseignants.find(e => e.id === id) || null)
    }
  }, [selectedEns, enseignements, enseignants])

  const toggle = (id) =>
    setPresenceMap(prev => ({ ...prev, [id]: prev[id] === 'present' ? 'absent' : 'present' }))

  const setAll = (status) => {
    const map = {}
    etudiantsFil.forEach(e => { map[e.id] = status })
    setPresenceMap(map)
  }

  /* ── Enregistrer ── */
  const handleSave = async () => {
    if (!selectedFiliere) {
      setToast({ msg: 'Sélectionnez une filière', type: 'error' })
      return
    }
    setSaving(true)
    try {
      const absents = etudiantsFil.filter(e => presenceMap[e.id] === 'absent')

      const payload = {
        date:          new Date(date).toISOString(),
        filieres:      `/api/filieres/${selectedFiliere}`,
        enseignements: selectedEns ? `/api/enseignements/${selectedEns}` : undefined,
        enseignants:   autoEnseignant ? `/api/enseignants/${autoEnseignant.id}` : undefined,
        etudiants:     absents.map(e => `/api/etudiants/${e.id}`),
        /* ✅ true = tout le monde présent | false = au moins 1 absent */
        status:        absents.length === 0,
      }

      await presenceService.create(payload)
      setToast({
        msg: absents.length === 0
          ? '✅ Tout le monde est présent — séance enregistrée'
          : `✅ Présences enregistrées — ${absents.length} absent(s)`,
        type: 'success'
      })

      /* Réinitialiser */
      setSelectedEns('')
      setSelectedFiliere('')
      setPresenceMap({})
      setEtudiantsFil([])

    } catch (e) {
      console.error(e)
      setToast({ msg: "Erreur lors de l'enregistrement", type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  /* ════════════ LISTE — MODIFIER ════════════ */
  const openEdit = (presence) => {
    const fid       = idFromIri(presence.filieres)
    const filEtu    = etudiants.filter(e => String(idFromIri(e.filieres)) === String(fid))
    const absentIds = (presence.etudiants || []).map(x => idFromIri(x))
    const map       = {}
    filEtu.forEach(e => { map[e.id] = absentIds.includes(e.id) ? 'absent' : 'present' })

    setEditEtudiants(filEtu)
    setEditMap(map)
    setEditPresence(presence)
  }

  const toggleEdit = (id) =>
    setEditMap(prev => ({ ...prev, [id]: prev[id] === 'present' ? 'absent' : 'present' }))

  const handleUpdate = async () => {
    try {
      const absents = editEtudiants.filter(e => editMap[e.id] === 'absent')

      const payload = {
        etudiants: absents.map(e => `/api/etudiants/${e.id}`),
        /* ✅ même logique : true si 0 absent */
        status:    absents.length === 0,
      }

      await presenceService.update(editPresence.id, payload)
      setToast({ msg: 'Présence modifiée avec succès', type: 'success' })
      setEditPresence(null)
      loadPresences()
    } catch (e) {
      console.error(e)
      setToast({ msg: 'Erreur modification', type: 'error' })
    }
  }

  /* ════════════ LISTE — SUPPRIMER ════════════ */
  const handleDelete = async (id) => {
    try {
      await presenceService.delete(id)
      setToast({ msg: 'Présence supprimée', type: 'success' })
      loadPresences()
    } catch {
      setToast({ msg: 'Erreur suppression', type: 'error' })
    }
    setConfirm(null)
  }

  /* ════════════ HELPERS AFFICHAGE ════════════ */
  const ensLabel = (e) => {
    let matNom = ''
    if (e.matiere && typeof e.matiere === 'object') {
      matNom = e.matiere.nom || e.matiere.nomMatiere || ''
    } else if (typeof e.matiere === 'string') {
      const id = idFromIri(e.matiere)
      matNom = matieres.find(m => m.id === id)?.nom || `Matière #${id}`
    }
    let filNom = ''
    if (e.filiere && typeof e.filiere === 'object') {
      filNom = e.filiere.libelle || ''
    } else if (typeof e.filiere === 'string') {
      const id = idFromIri(e.filiere)
      filNom = filieres.find(f => f.id === id)?.libelle || `Filière #${id}`
    }
    if (matNom && filNom) return `${matNom} — ${filNom}`
    if (matNom) return matNom
    if (filNom) return filNom
    return `Séance #${e.id}`
  }

  const getFiliereName = (iri) => {
    const id = idFromIri(iri)
    return filieres.find(f => f.id === id)?.libelle || `Filière #${id}`
  }

  const getEnseignantName = (iri) => {
    if (!iri) return '—'
    const id = idFromIri(iri)
    const e  = enseignants.find(e => e.id === id)
    return e ? `${e.prenom || ''} ${e.nom || ''}`.trim() : '—'
  }

  const getMatiereName = (enseignementIri) => {
    const ensId = idFromIri(enseignementIri)
    const ens   = enseignements.find(e => e.id === ensId)
    if (!ens) return '—'
    if (ens.matiere && typeof ens.matiere === 'object') return ens.matiere.nom || '—'
    if (typeof ens.matiere === 'string') {
      const mid = idFromIri(ens.matiere)
      return matieres.find(m => m.id === mid)?.nom || '—'
    }
    // Chercher la matière qui référence cet enseignement
    const mat = matieres.find(m =>
      (m.enseignements || []).some(e => idFromIri(e) === ensId)
    )
    return mat?.nom || '—'
  }

  const presentCount = Object.values(presenceMap).filter(v => v === 'present').length
  const absentCount  = Object.values(presenceMap).filter(v => v === 'absent').length

  /* ════════════════════════════════════════
     RENDU
  ════════════════════════════════════════ */
  return (
    <div>

      <div className="page-header">
        <h2>Présences & Absences</h2>
        <p>Saisir et consulter les présences par séance</p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4,
        background: '#f1f5f9', borderRadius: 10,
        padding: 4, marginBottom: 20, width: 'fit-content'
      }}>
        {[
          { key: TAB_SAISIE, label: '✏️ Saisie présences' },
          { key: TAB_LISTE,  label: '📋 Liste des présences' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none',
            background: tab === t.key ? '#ffffff' : 'transparent',
            color:      tab === t.key ? '#0f172a' : '#64748b',
            fontWeight: tab === t.key ? 600 : 400,
            fontSize: 14, cursor: 'pointer',
            boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            transition: 'all .15s'
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════
          ONGLET SAISIE
      ══════════════════════════════════════ */}
      {tab === TAB_SAISIE && (
        <>
          {/* Paramètres */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span className="card-title">Paramètres de la séance</span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16, padding: '16px 0 4px'
            }}>

              <div className="form-group">
                <label className="form-label">Date de la séance</label>
                <input type="date" className="form-input" value={date}
                  onChange={e => setDate(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Filière</label>
                <select className="form-select" value={selectedFiliere}
                  onChange={e => setSelectedFiliere(e.target.value)}>
                  <option value="">Sélectionner une filière</option>
                  {filieres.map(f => (
                    <option key={f.id} value={f.id}>{f.libelle || f.nom}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Séance / Matière</label>
                <select className="form-select" value={selectedEns}
                  onChange={e => setSelectedEns(e.target.value)}>
                  <option value="">Sélectionner une séance</option>
                  {enseignements.map(e => (
                    <option key={e.id} value={e.id}>{ensLabel(e)}</option>
                  ))}
                </select>
              </div>

              {/* Enseignant auto */}
              <div className="form-group">
                <label className="form-label">Enseignant</label>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: autoEnseignant ? '#f0fdf4' : '#f8fafc',
                  minHeight: 42, transition: 'all .2s'
                }}>
                  {autoEnseignant ? (
                    <>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 12, fontWeight: 700
                      }}>
                        {(autoEnseignant.prenom?.[0] || autoEnseignant.nom?.[0] || '?').toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                          {autoEnseignant.prenom} {autoEnseignant.nom}
                        </div>
                        {autoEnseignant.email && (
                          <div style={{ fontSize: 11, color: '#64748b' }}>
                            {autoEnseignant.email}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <span style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>
                      Sélectionnez une séance pour voir l'enseignant
                    </span>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* État vide */}
          {!selectedFiliere && (
            <div className="card">
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
                <p>Sélectionnez une filière pour afficher les étudiants</p>
              </div>
            </div>
          )}

          {selectedFiliere && etudiantsFil.length === 0 && (
            <div className="card">
              <div className="empty-state">
                <p>Aucun étudiant dans cette filière.</p>
              </div>
            </div>
          )}

          {etudiantsFil.length > 0 && (
            <>
              {/* Compteurs */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div className="stat-card" style={{ flex: 1 }}>
                  <div className="stat-label">Présents</div>
                  <div className="stat-value" style={{ color: 'var(--success)', fontSize: '1.6rem' }}>
                    {presentCount}
                  </div>
                </div>
                <div className="stat-card" style={{ flex: 1 }}>
                  <div className="stat-label">Absents</div>
                  <div className="stat-value" style={{ color: 'var(--danger)', fontSize: '1.6rem' }}>
                    {absentCount}
                  </div>
                </div>
                <div className="stat-card" style={{ flex: 1 }}>
                  <div className="stat-label">Total</div>
                  <div className="stat-value" style={{ fontSize: '1.6rem' }}>
                    {etudiantsFil.length}
                  </div>
                </div>
              </div>

              {/* Liste étudiants */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Liste des étudiants</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setAll('present')}>
                      ✅ Tous présents
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setAll('absent')}>
                      ❌ Tous absents
                    </button>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: 10, marginTop: 12
                }}>
                  {etudiantsFil.map(e => {
                    const present = presenceMap[e.id] === 'present'
                    return (
                      <div key={e.id} onClick={() => toggle(e.id)} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                        border: `1px solid ${present ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)'}`,
                        background: present ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                        cursor: 'pointer', transition: 'all 0.18s', userSelect: 'none'
                      }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                          background: present ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)',
                          color: present ? 'var(--success)' : 'var(--danger)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {present ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2.5">
                              <line x1="18" y1="6" x2="6" y2="18"/>
                              <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          )}
                        </div>
                        <span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text)', flex: 1 }}>
                          {e.prenom} {e.nom}
                        </span>
                        <span style={{
                          fontSize: '0.75rem', fontWeight: 600,
                          color: present ? 'var(--success)' : 'var(--danger)'
                        }}>
                          {present ? 'Présent' : 'Absent'}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Résumé avant enregistrement */}
                {absentCount > 0 && (
                  <div style={{
                    marginTop: 16, padding: '10px 14px',
                    background: 'rgba(239,68,68,0.06)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 8, fontSize: '0.85rem', color: '#dc2626'
                  }}>
                    ⚠️ <strong>{absentCount}</strong> étudiant(s) absent(s) —
                    la séance sera marquée comme <strong>ayant des absences</strong>
                  </div>
                )}
                {absentCount === 0 && etudiantsFil.length > 0 && (
                  <div style={{
                    marginTop: 16, padding: '10px 14px',
                    background: 'rgba(34,197,94,0.06)',
                    border: '1px solid rgba(34,197,94,0.2)',
                    borderRadius: 8, fontSize: '0.85rem', color: '#16a34a'
                  }}>
                    ✅ Tout le monde est présent — la séance sera marquée comme <strong>complète</strong>
                  </div>
                )}

                <div style={{
                  display: 'flex', justifyContent: 'flex-end',
                  marginTop: 20, paddingTop: 20,
                  borderTop: '1px solid var(--border)'
                }}>
                  <button className="btn btn-primary" onClick={handleSave}
                    disabled={saving || !selectedFiliere}>
                    {saving ? 'Enregistrement...' : '💾 Enregistrer les présences'}
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ══════════════════════════════════════
          ONGLET LISTE
      ══════════════════════════════════════ */}
      {tab === TAB_LISTE && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Présences enregistrées</span>
            <button className="btn btn-secondary btn-sm" onClick={loadPresences}>
              🔄 Actualiser
            </button>
          </div>

          {loadingList ? (
            <div style={{ padding: 40, textAlign: 'center' }}>Chargement...</div>
          ) : presences.length === 0 ? (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              <p>Aucune présence enregistrée.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Filière</th>
                    <th>Matière</th>
                    <th>Enseignant</th>
                    <th>Absents</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {presences.map(p => {
                    const nbAbsents = p.etudiants?.length || 0
                    return (
                      <tr key={p.id}>

                        <td>{p.date ? new Date(p.date).toLocaleDateString('fr-FR') : '—'}</td>

                        <td>{getFiliereName(p.filieres)}</td>

                        <td>{getMatiereName(p.enseignements)}</td>

                        <td>{getEnseignantName(p.enseignants)}</td>

                        <td>
                          <span style={{
                            background: nbAbsents > 0 ? '#fee2e2' : '#dcfce7',
                            color:      nbAbsents > 0 ? '#dc2626' : '#16a34a',
                            borderRadius: 12, padding: '2px 10px',
                            fontSize: 13, fontWeight: 600
                          }}>
                            {nbAbsents > 0 ? `❌ ${nbAbsents} absent(s)` : '✅ Aucun'}
                          </span>
                        </td>

                        <td>
                          {/* ✅ status true = tout présent | false = absents à gérer */}
                          <span style={{
                            background: p.status ? '#dcfce7' : '#fee2e2',
                            color:      p.status ? '#16a34a' : '#dc2626',
                            borderRadius: 12, padding: '2px 10px',
                            fontSize: 12, fontWeight: 600
                          }}>
                            {p.status ? '✅ Complet' : '⚠️ Absences'}
                          </span>
                        </td>

                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn-icon" title="Modifier"
                              onClick={() => openEdit(p)}>
                              ✏️
                            </button>
                            <button className="btn-icon danger" title="Supprimer"
                              onClick={() => setConfirm(p)}>
                              🗑️
                            </button>
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
      )}

      {/* ══════════════════════════════════════
          MODAL ÉDITION
      ══════════════════════════════════════ */}
      {editPresence && (
        <div className="modal-overlay" onClick={() => setEditPresence(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}
            style={{ maxWidth: 580, width: '95%' }}>

            <div className="modal-header">
              <span className="modal-title">
                ✏️ Modifier — {editPresence.date
                  ? new Date(editPresence.date).toLocaleDateString('fr-FR') : ''}
              </span>
              <button className="btn-icon" onClick={() => setEditPresence(null)}>✖</button>
            </div>

            <div style={{ padding: '16px 20px' }}>

              {/* Résumé édition */}
              <div style={{
                background: 'var(--bg)', borderRadius: 8,
                padding: '10px 14px', marginBottom: 14,
                fontSize: '0.83rem', color: 'var(--text2)',
                border: '1px solid var(--border)',
                display: 'flex', gap: 16, flexWrap: 'wrap'
              }}>
                <span>🎓 {getFiliereName(editPresence.filieres)}</span>
                <span>📚 {getMatiereName(editPresence.enseignements)}</span>
                <span>
                  👥 {Object.values(editMap).filter(v => v === 'absent').length} absent(s)
                  sur {editEtudiants.length}
                </span>
              </div>

              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
                Cliquez sur un étudiant pour basculer présent / absent
              </p>

              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <button className="btn btn-secondary btn-sm"
                  onClick={() => {
                    const map = {}
                    editEtudiants.forEach(e => { map[e.id] = 'present' })
                    setEditMap(map)
                  }}>
                  ✅ Tous présents
                </button>
                <button className="btn btn-secondary btn-sm"
                  onClick={() => {
                    const map = {}
                    editEtudiants.forEach(e => { map[e.id] = 'absent' })
                    setEditMap(map)
                  }}>
                  ❌ Tous absents
                </button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 8, maxHeight: 360, overflowY: 'auto'
              }}>
                {editEtudiants.map(e => {
                  const present = editMap[e.id] === 'present'
                  return (
                    <div key={e.id} onClick={() => toggleEdit(e.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', borderRadius: 8,
                      border: `1px solid ${present ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)'}`,
                      background: present ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                      cursor: 'pointer', userSelect: 'none', transition: 'all .15s'
                    }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                        background: present ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                        color: present ? 'var(--success)' : 'var(--danger)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {present ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        )}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#1e293b', flex: 1 }}>
                        {e.prenom} {e.nom}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        color: present ? 'var(--success)' : 'var(--danger)'
                      }}>
                        {present ? 'Présent' : 'Absent'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditPresence(null)}>
                Annuler
              </button>
              <button className="btn btn-primary" onClick={handleUpdate}>
                💾 Enregistrer les modifications
              </button>
            </div>

          </div>
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          message={`Supprimer la présence du ${confirm.date
            ? new Date(confirm.date).toLocaleDateString('fr-FR') : ''} ?`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {toast && (
        <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}

    </div>
  )
}