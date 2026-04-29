import { useEffect, useState } from 'react'
import {
  enseignementCreateService,
  enseignantService,
  filiereService,
  matiereService,
  periodeService,
  etudiantService
} from '../../services/api'

import Toast from '../../components/Toast'
import ConfirmDialog from '../../components/ConfirmDialog'
import './Enseignements.css'

const EMPTY = {
  date: '',
  enseigants: '',
  filiere: '',
  matiere: '',
  periode: '',
  etudiant: []
}

const idFromIri = (iri) => parseInt(iri?.split('/').pop())

const findLabel = (iri, list, key = 'nom') => {
  if (!iri) return '-'
  const id = idFromIri(iri)
  return list.find(x => x.id === id)?.[key] || '-'
}

const initials = (nom = '', prenom = '') =>
  `${nom[0] || ''}${prenom[0] || ''}`.toUpperCase()

export default function Enseignements() {

  const [items, setItems]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [form, setForm]               = useState(EMPTY)
  const [modal, setModal]             = useState(false)
  const [editing, setEditing]         = useState(null)
  const [toast, setToast]             = useState(null)
  const [confirm, setConfirm]         = useState(null)
  const [enseignants, setEnseignants] = useState([])
  const [filieres, setFilieres]       = useState([])
  const [matieres, setMatieres]       = useState([])
  const [periodes, setPeriodes]       = useState([])
  const [etudiants, setEtudiants]     = useState([])

  const normalize = (data) => {
    if (!data) return []
    if (Array.isArray(data)) return data
    if (data['hydra:member']) return data['hydra:member']
    if (data['member']) return data['member']
    return []
  }

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    try {
      setLoading(true)
      const [ens, fil, mat, per, etu, ensmts] = await Promise.all([
        enseignantService.getAll(),
        filiereService.getAll(),
        matiereService.getAll(),
        periodeService.getAll(),
        etudiantService.getAll(),
        enseignementCreateService.getAll()
      ])
      setEnseignants(normalize(ens.data))
      setFilieres(normalize(fil.data))
      setMatieres(normalize(mat.data))
      setPeriodes(normalize(per.data))
      setEtudiants(normalize(etu.data))
      setItems(normalize(ensmts.data))
    } catch (e) {
      console.error(e)
      setToast({ msg: "Erreur de chargement", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setForm(EMPTY)
    setEditing(null)
    setModal(true)
  }

  const openEdit = (e) => {
    const extractId = (f) => {
      if (!f) return ''
      if (typeof f === 'string') return idFromIri(f)
      if (typeof f === 'object') return f.id
      return ''
    }
    setForm({
      date:      e.date?.split('T')[0] || '',
      enseigants: extractId(e.enseigants),
      filiere:   extractId(e.filiere),
      matiere:   extractId(e.matiere),
      periode:   extractId(e.periode),
      etudiant:  (e.etudiant || []).map(x =>
        typeof x === 'string' ? idFromIri(x) : x.id
      )
    })
    setEditing(e)
    setModal(true)
  }

  const toggleEtudiant = (id) => {
    setForm(prev => ({
      ...prev,
      etudiant: prev.etudiant.includes(id)
        ? prev.etudiant.filter(e => e !== id)
        : [...prev.etudiant, id]
    }))
  }

  const handleSubmit = async () => {
    if (!form.date || !form.enseigants || !form.filiere || !form.matiere || !form.periode) {
      setToast({ msg: "Champs obligatoires manquants", type: "error" })
      return
    }
    const payload = {
      date:      form.date,
      enseigants: `/api/enseignants/${form.enseigants}`,
      filiere:   `/api/filieres/${form.filiere}`,
      matiere:   `/api/matieres/${form.matiere}`,
      periode:   `/api/periodes/${form.periode}`,
      etudiant:  form.etudiant.map(id => `/api/etudiants/${id}`)
    }
    try {
      if (editing) {
        await enseignementCreateService.update(editing.id, payload)
        setToast({ msg: "Modifié avec succès", type: "success" })
      } else {
        await enseignementCreateService.create(payload)
        setToast({ msg: "Créé avec succès", type: "success" })
      }
      setModal(false)
      loadAll()
    } catch (e) {
      console.error(e)
      setToast({ msg: "Erreur serveur", type: "error" })
    }
  }

  const handleDelete = async (id) => {
    try {
      await enseignementCreateService.delete(id)
      setToast({ msg: "Supprimé avec succès", type: "success" })
      loadAll()
    } catch {
      setToast({ msg: "Erreur lors de la suppression", type: "error" })
    }
    setConfirm(null)
  }

  /* ════════════ RENDU ════════════ */
  return (
    <div>

      <div className="page-header">
        <h2>Enseignements</h2>
        <p>Gestion des séances de cours</p>
      </div>

      <div className="card">
        <div className="search-bar">
          <button className="btn btn-primary" onClick={openCreate}>
            + Nouveau enseignement
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>Chargement...</div>
        ) : items.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
            Aucun enseignement enregistré.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Matière</th>
                  <th>Filière</th>
                  <th>Enseignant</th>
                  <th>Étudiants</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(e => (
                  <tr key={e.id}>
                    <td>{e.date?.split('T')[0]}</td>
                    <td>{findLabel(e.matiere,    matieres,    'nom')}</td>
                    <td>{findLabel(e.filiere,    filieres,    'libelle')}</td>
                    <td>{findLabel(e.enseigants, enseignants, 'nom')}</td>
                    <td>
                      <span style={{
                        background: '#e0f2fe', borderRadius: 12,
                        padding: '2px 10px', fontSize: 13, color: '#0369a1'
                      }}>
                        {(e.etudiant || []).length} étudiant(s)
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-icon" onClick={() => openEdit(e)}>✏️</button>
                        <button className="btn-icon danger" onClick={() => setConfirm(e)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ════════════ MODAL STYLÉ ════════════ */}
      {modal && (
        <div className="esm-overlay" onClick={() => setModal(false)}>
          <div className="esm-modal" onClick={e => e.stopPropagation()}>

            {/* ── Header ── */}
            <div className="esm-header">
              <div className="esm-badge">
                 {editing ? 'Modification' : 'Création'}
              </div>
              <h2 className="esm-title">
                {editing ? 'Modifier la séance' : 'Nouvelle séance de cours'}
              </h2>
              <p className="esm-subtitle">
                {editing
                  ? 'Mettez à jour les informations de la séance'
                  : 'Remplissez les informations pour créer une séance'}
              </p>
              <button className="esm-close" onClick={() => setModal(false)}>✕</button>
            </div>

            {/* ── Body ── */}
            <div className="esm-body">

              <p className="esm-section-label">Informations générales</p>

              <div className="esm-grid">

                <div className="esm-field">
                  <label className="esm-label">Date *</label>
                  <input
                    type="date"
                    className="esm-input"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                  />
                </div>

                <div className="esm-field">
                  <label className="esm-label">Enseignant *</label>
                  <select
                    className="esm-select"
                    value={form.enseigants}
                    onChange={e => setForm({ ...form, enseigants: e.target.value })}
                  >
                    <option value="">-- Choisir un enseignant --</option>
                    {enseignants.map(e => (
                      <option key={e.id} value={e.id}>{e.nom}</option>
                    ))}
                  </select>
                </div>

                <div className="esm-field">
                  <label className="esm-label">Filière *</label>
                  <select
                    className="esm-select"
                    value={form.filiere}
                    onChange={e => setForm({ ...form, filiere: e.target.value })}
                  >
                    <option value="">-- Choisir une filière --</option>
                    {filieres.map(f => (
                      <option key={f.id} value={f.id}>{f.libelle}</option>
                    ))}
                  </select>
                </div>

                <div className="esm-field">
                  <label className="esm-label">Matière *</label>
                  <select
                    className="esm-select"
                    value={form.matiere}
                    onChange={e => setForm({ ...form, matiere: e.target.value })}
                  >
                    <option value="">-- Choisir une matière --</option>
                    {matieres.map(m => (
                      <option key={m.id} value={m.id}>{m.nom}</option>
                    ))}
                  </select>
                </div>

                <div className="esm-field">
                  <label className="esm-label">Période *</label>
                  <select
                    className="esm-select"
                    value={form.periode}
                    onChange={e => setForm({ ...form, periode: e.target.value })}
                  >
                    <option value="">-- Choisir une période --</option>
                    {periodes.map(p => (
                      <option key={p.id} value={p.id}>{p.libelle}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* ── Étudiants ── */}
              <div className="esm-stu-header">
                <p className="esm-section-label" style={{ margin: 0 }}>
                  Étudiants inscrits
                </p>
                <span className="esm-count-pill">{form.etudiant.length} sélectionné(s)</span>
              </div>

              <div className="esm-stu-box" style={{ marginTop: 10 }}>
                {etudiants.length === 0 ? (
                  <div className="esm-stu-empty">Aucun étudiant disponible</div>
                ) : (
                  etudiants.map(etu => {
                    const checked = form.etudiant.includes(etu.id)
                    return (
                      <div
                        key={etu.id}
                        className={`esm-stu-item ${checked ? 'checked' : ''}`}
                        onClick={() => toggleEtudiant(etu.id)}
                      >
                        <div className="esm-checkbox">
                          {checked && <span className="esm-checkbox-tick">✓</span>}
                        </div>
                        <div className="esm-stu-avatar">
                          {initials(etu.nom, etu.prenom)}
                        </div>
                        <span className="esm-stu-name">
                          {etu.nom} {etu.prenom}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>

            </div>

            {/* ── Footer ── */}
            <div className="esm-footer">
              <button className="esm-btn-cancel" onClick={() => setModal(false)}>
                Annuler
              </button>
              <button className="esm-btn-submit" onClick={handleSubmit}>
                {editing ? '✏️ Modifier' : '✚ Créer la séance'}
              </button>
            </div>

          </div>
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {confirm && (
        <ConfirmDialog
          message={`Supprimer l'enseignement du ${confirm.date?.split('T')[0]} ?`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}

    </div>
  )
}