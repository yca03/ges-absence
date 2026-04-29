import { useState } from 'react'
import { useCrud } from '../../services/useCrud'
import { filiereService } from '../../services/api'
import Toast from '../../components/Toast'
import ConfirmDialog from '../../components/ConfirmDialog'

const EMPTY = {
  libelle: '',
  nombre: ''
}

export default function Filieres() {
  const { items, loading, create, update, remove } = useCrud(filiereService)

  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [toast, setToast] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [search, setSearch] = useState('')

  // =====================
  // OPEN CREATE
  // =====================
  const openCreate = () => {
    setForm(EMPTY)
    setEditing(null)
    setModal(true)
  }

  // =====================
  // OPEN EDIT
  // =====================
  const openEdit = (f) => {
    setForm({
      libelle: f.libelle || '',
      nombre: f.nombre || ''
    })
    setEditing(f)
    setModal(true)
  }

  // =====================
  // SUBMIT CREATE / UPDATE
  // =====================
  const handleSubmit = async () => {
    try {
      const payload = {
        libelle: form.libelle,
        nombre: form.nombre
      }

      if (editing) await update(editing.id, payload)
      else await create(payload)

      setModal(false)

      setToast({
        msg: editing ? 'Filière modifiée !' : 'Filière créée !',
        type: 'success'
      })

    } catch (e) {
      setToast({
        msg: "Erreur lors de l'enregistrement",
        type: 'error'
      })
    }
  }

  // =====================
  // DELETE
  // =====================
  const handleDelete = async (id) => {
    try {
      await remove(id)
      setToast({ msg: 'Filière supprimée', type: 'success' })
    } catch {
      setToast({ msg: 'Erreur lors de la suppression', type: 'error' })
    }
    setConfirm(null)
  }

  // =====================
  // FILTER
  // =====================
  const filtered = items.filter(f =>
    (f.libelle || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>

      {/* HEADER */}
      <div className="page-header">
        <h2>Filières</h2>
        <p>Gestion des filières</p>
      </div>

      {/* CARD */}
      <div className="card">

        {/* SEARCH + BUTTON */}
        <div className="search-bar">

          <div className="search-input-wrap">
            <input
              className="search-input"
              placeholder="Rechercher une filière..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" onClick={openCreate}>
            Nouvelle filière
          </button>

        </div>

        {/* TABLE */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            Chargement...
          </div>
        ) : (
          <div className="table-container">

            <table>
              <thead>
                <tr>
                  <th>Libellé</th>
                  <th>Nombre</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={3}>
                      <div className="empty-state">
                        Aucune filière trouvée
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map(f => (
                    <tr key={f.id}>

                      <td>{f.libelle}</td>

                      <td>
                        {f.nombre ? (
                          <span className="badge badge-green">
                            {f.nombre}
                          </span>
                        ) : '—'}
                      </td>

                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>

                          <button
                            className="btn-icon"
                            onClick={() => openEdit(f)}
                          >
                            ✏️
                          </button>

                          <button
                            className="btn-icon danger"
                            onClick={() => setConfirm(f)}
                          >
                            🗑️
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>

            <div className="modal-header">
              <span className="modal-title">
                {editing ? 'Modifier la filière' : 'Nouvelle filière'}
              </span>
              <button className="btn-icon" onClick={() => setModal(false)}>
                ✖
              </button>
            </div>

            <div className="form-group">
              <label>Libellé *</label>
              <input
                className="form-input"
                value={form.libelle}
                onChange={(e) =>
                  setForm({ ...form, libelle: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Nombre d'étudiants *</label>
              <input
                type="number"
                className="form-input"
                value={form.nombre}
                onChange={(e) =>
                  setForm({ ...form, nombre: e.target.value })
                }
              />
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setModal(false)}
              >
                Annuler
              </button>

              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={!form.libelle || !form.nombre}
              >
                {editing ? 'Enregistrer' : 'Créer'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CONFIRM DELETE */}
      {confirm && (
        <ConfirmDialog
          message={`Supprimer la filière "${confirm.libelle}" ?`}
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