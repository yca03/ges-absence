import { useState, useEffect } from 'react'
import { useCrud } from '../../services/useCrud'
import { matiereService, filiereService } from '../../services/api'
import Toast from '../../components/Toast'
import ConfirmDialog from '../../components/ConfirmDialog'

const EMPTY = {
  nom: '',
  coefficient: '',
  volumeHoraire: '',
  filieres: []
}

export default function Matieres() {
  const { items, loading, create, update, remove } = useCrud(matiereService)
  const [filieres, setFilieres] = useState([])

  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [toast, setToast] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [search, setSearch] = useState('')

  // Charger les filières
  useEffect(() => {
    filiereService.getAll()
      .then(res => setFilieres(res.data?.member || []))
      .catch(() => setFilieres([]))
  }, [])

  const openCreate = () => {
    setForm(EMPTY)
    setEditing(null)
    setModal(true)
  }

  const openEdit = (m) => {
    setForm({
      nom: m.nom || '',
      coefficient: m.coefficient || '',
      volumeHoraire: m.volumeHoraire || '',
      filieres: m.filieres || []
    })
    setEditing(m)
    setModal(true)
  }

  // Toggle sélection d'une filière (IRI string)
  const toggleFiliere = (iri) => {
    setForm(prev => {
      const already = prev.filieres.includes(iri)
      return {
        ...prev,
        filieres: already
          ? prev.filieres.filter(f => f !== iri)
          : [...prev.filieres, iri]
      }
    })
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        nom: form.nom,
        coefficient: form.coefficient,
        volumeHoraire: form.volumeHoraire,
        filieres: form.filieres  // tableau d'IRI ex: ["/api/filieres/1"]
      }

      if (editing) await update(editing.id, payload)
      else await create(payload)

      setModal(false)
      setToast({
        msg: editing ? 'Matière modifiée !' : 'Matière créée !',
        type: 'success'
      })
    } catch (e) {
      console.log(e)
      setToast({ msg: "Erreur lors de l'enregistrement", type: 'error' })
    }
  }

  const handleDelete = async (id) => {
    try {
      await remove(id)
      setToast({ msg: 'Matière supprimée', type: 'success' })
    } catch {
      setToast({ msg: 'Erreur lors de la suppression', type: 'error' })
    }
    setConfirm(null)
  }

  // Résoudre le nom d'une filière depuis son IRI
  const getFiliereName = (iri) => {
    const id = iri?.toString().split('/').pop()
    const found = filieres.find(f => f.id?.toString() === id)
    return found?.nom || found?.libelle || iri
  }

  const filtered = items.filter(m =>
    (m.nom || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>

      {/* HEADER */}
      <div className="page-header">
        <h2>Matières</h2>
        <p>Gérer les matières enseignées</p>
      </div>

      {/* CARD */}
      <div className="card">

        {/* SEARCH + BUTTON */}
        <div className="search-bar">
          <div className="search-input-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="search-input"
              placeholder="Rechercher une matière..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            Nouvelle matière
          </button>
        </div>

        {/* TABLE */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>
            Chargement...
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Filières</th>
                  <th>Coefficient</th>
                  <th>Volume horaire</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state">
                        <p>Aucune matière trouvée</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600 }}>{m.nom}</td>

                    {/* FILIÈRES */}
                    <td>
                      {m.filieres && m.filieres.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {m.filieres.map((f, i) => (
                            <span key={i} style={{
                              display: 'inline-block',
                              padding: '2px 10px',
                              background: '#dbeafe',
                              color: '#1d4ed8',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 600
                            }}>
                              {getFiliereName(f)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: 13 }}>—</span>
                      )}
                    </td>

                    <td>{m.coefficient}</td>
                    <td>{m.volumeHoraire}h</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-icon" onClick={() => openEdit(m)}>✏️</button>
                        <button className="btn-icon danger" onClick={() => setConfirm(m)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>

            <div className="modal-header">
              <span className="modal-title">
                {editing ? 'Modifier la matière' : 'Nouvelle matière'}
              </span>
              <button className="btn-icon" onClick={() => setModal(false)}>✖</button>
            </div>

            <div className="form-grid">

              {/* NOM */}
              <div className="form-group">
                <label className="form-label">Nom de la matière *</label>
                <input
                  className="form-input"
                  placeholder="Ex: Algorithmique"
                  value={form.nom}
                  onChange={e => setForm({ ...form, nom: e.target.value })}
                />
              </div>

              {/* FILIÈRES (multi-select checkboxes) */}
              <div className="form-group">
                <label className="form-label">Filières associées</label>
                <div style={{
                  border: '1.5px solid #bfdbfe',
                  borderRadius: 8,
                  padding: '10px 12px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 10,
                  background: '#f8faff',
                  maxHeight: 130,
                  overflowY: 'auto'
                }}>
                  {filieres.length === 0 ? (
                    <span style={{ fontSize: 13, color: '#94a3b8' }}>Aucune filière disponible</span>
                  ) : filieres.map(f => {
                    const iri = f['@id'] || `/api/filieres/${f.id}`
                    const checked = form.filieres.includes(iri)
                    return (
                      <label key={f.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 13,
                        cursor: 'pointer',
                        padding: '4px 10px',
                        borderRadius: 6,
                        background: checked ? '#dbeafe' : 'white',
                        border: `1.5px solid ${checked ? '#1d4ed8' : '#e2e8f0'}`,
                        color: checked ? '#1d4ed8' : '#334155',
                        fontWeight: checked ? 600 : 400,
                        transition: 'all 0.15s'
                      }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleFiliere(iri)}
                          style={{ display: 'none' }}
                        />
                        {f.nom || f.libelle}
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* COEFFICIENT + VOLUME */}
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label className="form-label">Coefficient</label>
                  <input
                    type="number"
                    className="form-input"
                    value={form.coefficient}
                    onChange={e => setForm({ ...form, coefficient: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Volume horaire</label>
                  <input
                    type="number"
                    className="form-input"
                    value={form.volumeHoraire}
                    onChange={e => setForm({ ...form, volumeHoraire: e.target.value })}
                  />
                </div>
              </div>

            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>
                Annuler
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={!form.nom}
              >
                {editing ? 'Enregistrer' : 'Créer'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CONFIRM */}
      {confirm && (
        <ConfirmDialog
          message={`Supprimer la matière "${confirm.nom}" ?`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* TOAST */}
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

    </div>
  )
}