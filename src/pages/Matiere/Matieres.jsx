import { useState } from 'react'
import { useCrud } from '../../services/useCrud'
import { matiereService } from '../../services/api'
import Toast from '../../components/Toast'
import ConfirmDialog from '../../components/ConfirmDialog'

const EMPTY = {
  nom: '',
  coefficient: '',
  volumeHoraire: ''
}

export default function Matieres() {
  const { items, loading, create, update, remove } = useCrud(matiereService)

  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [toast, setToast] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [search, setSearch] = useState('')

  const openCreate = () => {
    setForm(EMPTY)
    setEditing(null)
    setModal(true)
  }

  const openEdit = (m) => {
    setForm({
      nom: m.nom || '',
      coefficient: m.coefficient || '',
      volumeHoraire: m.volumeHoraire || ''
    })
    setEditing(m)
    setModal(true)
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        nom: form.nom,
        coefficient: form.coefficient,
        volumeHoraire: form.volumeHoraire
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
                  <th>Coefficient</th>
                  <th>Volume horaire</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="empty-state">
                        <p>Aucune matière trouvée</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600 }}>{m.nom}</td>
                    <td>{m.coefficient}</td>
                    <td>{m.volumeHoraire}h</td>

                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-icon" onClick={() => openEdit(m)}>
                          ✏️
                        </button>

                        <button className="btn-icon danger" onClick={() => setConfirm(m)}>
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>

      {/* MODAL (SAME STYLE AS OTHERS) */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>

            <div className="modal-header">
              <span className="modal-title">
                {editing ? 'Modifier la matière' : 'Nouvelle matière'}
              </span>

              <button className="btn-icon" onClick={() => setModal(false)}>
                ✖
              </button>
            </div>

            <div className="form-grid">

              <div className="form-group">
                <label className="form-label">Nom de la matière *</label>
                <input
                  className="form-input"
                  placeholder="Ex: Algorithmique"
                  value={form.nom}
                  onChange={e => setForm({ ...form, nom: e.target.value })}
                />
              </div>

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