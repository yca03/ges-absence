import { useState } from 'react'
import { useCrud } from '../../services/useCrud'
import { periodeService } from '../../services/api'
import Toast from '../../components/Toast'
import ConfirmDialog from '../../components/ConfirmDialog'

const EMPTY = {
  libelle: '',
  date: '',
  dateFin: ''
}

export default function Periodes() {
  const { items, loading, create, update, remove } = useCrud(periodeService)

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

  const openEdit = (p) => {
    setForm({
      libelle: p.libelle || '',
      date: p.date ? p.date.slice(0, 10) : '',
      dateFin: p.dateFin ? p.dateFin.slice(0, 10) : ''
    })
    setEditing(p)
    setModal(true)
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        libelle: form.libelle,
        date: form.date ? new Date(form.date).toISOString() : null,
        dateFin: form.dateFin ? new Date(form.dateFin).toISOString() : null
      }

      if (editing) await update(editing.id, payload)
      else await create(payload)

      setModal(false)
      setToast({
        msg: editing ? 'Période modifiée !' : 'Période créée !',
        type: 'success'
      })
    } catch {
      setToast({ msg: "Erreur lors de l'enregistrement", type: 'error' })
    }
  }

  const handleDelete = async (id) => {
    try {
      await remove(id)
      setToast({ msg: 'Période supprimée', type: 'success' })
    } catch {
      setToast({ msg: 'Erreur lors de la suppression', type: 'error' })
    }
    setConfirm(null)
  }

  const filtered = items.filter(p =>
    (p.libelle || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>

      {/* HEADER */}
      <div className="page-header">
        <h2>Périodes</h2>
        <p>Gérer les périodes académiques</p>
      </div>

      {/* CARD */}
      <div className="card">

        {/* SEARCH + BUTTON */}
        <div className="search-bar">
          <div className="search-input-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>

            <input
              className="search-input"
              placeholder="Rechercher une période..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" onClick={openCreate}>
            <svg width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nouvelle période
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
                  <th>Libellé</th>
                  <th>Date début</th>
                  <th>Date fin</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="empty-state">
                        <p>Aucune période trouvée</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map(p => (
                    <tr key={p.id}>
                      <td>{p.libelle}</td>
                      <td>{p.date ? new Date(p.date).toLocaleDateString('fr-FR') : '—'}</td>
                      <td>{p.dateFin ? new Date(p.dateFin).toLocaleDateString('fr-FR') : '—'}</td>

                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn-icon" onClick={() => openEdit(p)}>
                            <svg width="14" height="14" viewBox="0 0 24 24"
                              fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>

                          <button className="btn-icon danger" onClick={() => setConfirm(p)}>
                            <svg width="14" height="14" viewBox="0 0 24 24"
                              fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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
                {editing ? 'Modifier la période' : 'Nouvelle période'}
              </span>

              <button className="btn-icon" onClick={() => setModal(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="form-grid">

              <div className="form-group">
                <label className="form-label">Libellé *</label>
                <input
                  className="form-input"
                  value={form.libelle}
                  onChange={e => setForm({ ...form, libelle: e.target.value })}
                />
              </div>

              <div className="form-grid form-grid-2">

                <div className="form-group">
                  <label className="form-label">Date début</label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date fin</label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.dateFin}
                    onChange={e => setForm({ ...form, dateFin: e.target.value })}
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
                disabled={!form.libelle}
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
          message={`Supprimer "${confirm.libelle}" ?`}
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