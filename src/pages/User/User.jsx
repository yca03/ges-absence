import { useState } from 'react'
import { useCrud } from '../../services/useCrud'
import { userService } from '../../services/api'
import Toast from '../../components/Toast'
import ConfirmDialog from '../../components/ConfirmDialog'
import './User.css'

const EMPTY = {
  prenom: '', nom: '', email: '', numero: '', password: '', roles: ['ROLE_USER']
}

const ROLE_OPTIONS = [
  { value: 'ROLE_USER',             label: 'Utilisateur' },
  { value: 'ROLE_ADMIN',            label: 'Administrateur' },
  { value: 'ROLE_ENSEIGNANT',       label: 'Enseignant' },
  { value: 'ROLE_RESPONSABLE',      label: 'Responsable' },
  { value: 'ROLE_ETUDIANT',         label: 'Étudiant' },
  { value: 'ROLE_DIRECTEUR_PEDAGO', label: 'Directeur pédagogique' },
  { value: 'ROLE_RESP_PARCOURS',    label: 'Responsable de parcours' },
]

const ROLE_BADGE = {
  ROLE_ADMIN:            { label: 'Administrateur',        color: '#0C447C', bg: '#E6F1FB' },
  ROLE_DIRECTEUR_PEDAGO: { label: 'Directeur pédagogique', color: '#712B13', bg: '#FAECE7' },
  ROLE_RESP_PARCOURS:    { label: 'Resp. parcours',        color: '#3B6D11', bg: '#EAF3DE' },
  ROLE_RESPONSABLE:      { label: 'Responsable',           color: '#854F0B', bg: '#FAEEDA' },
  ROLE_ENSEIGNANT:       { label: 'Enseignant',            color: '#0F6E56', bg: '#E1F5EE' },
  ROLE_ETUDIANT:         { label: 'Étudiant',              color: '#3C3489', bg: '#EEEDFE' },
  ROLE_USER:             { label: 'Utilisateur',           color: '#5F5E5A', bg: '#F1EFE8' },
}

const ROLE_PRIORITY = [
  'ROLE_ADMIN','ROLE_DIRECTEUR_PEDAGO','ROLE_RESP_PARCOURS',
  'ROLE_RESPONSABLE','ROLE_ENSEIGNANT','ROLE_ETUDIANT','ROLE_USER'
]

function getRoleBadge(roles = []) {
  const match = ROLE_PRIORITY.find(r => roles.includes(r))
  return ROLE_BADGE[match] || ROLE_BADGE.ROLE_USER
}

function getInitials(prenom, nom) {
  return ((prenom?.[0] || '') + (nom?.[0] || '')).toUpperCase() || '??'
}

export default function Users() {
  const { items, loading, create, update, remove } = useCrud(userService)

  const [modal, setModal]   = useState(false)
  const [form, setForm]     = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [toast, setToast]   = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [search, setSearch] = useState('')

  const openCreate = () => {
    setForm(EMPTY)
    setEditing(null)
    setModal(true)
  }

  const openEdit = (u) => {
    setForm({
      prenom: u.prenom || '',
      nom: u.nom || '',
      email: u.email || '',
      numero: u.numero || '',
      password: '',
      roles: u.roles?.filter(r => r !== 'ROLE_USER').length
        ? u.roles.filter(r => r !== 'ROLE_USER')
        : ['ROLE_USER']
    })
    setEditing(u)
    setModal(true)
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        prenom: form.prenom,
        nom: form.nom,
        email: form.email,
        numero: form.numero,
        roles: form.roles,
      }
      if (form.password) payload.password = form.password

      if (editing) await update(editing.id, payload)
      else await create(payload)

      setModal(false)
      setToast({ msg: editing ? 'Utilisateur modifié !' : 'Utilisateur créé !', type: 'success' })
    } catch {
      setToast({ msg: "Erreur lors de l'enregistrement", type: 'error' })
    }
  }

  const handleDelete = async (id) => {
    try {
      await remove(id)
      setToast({ msg: 'Utilisateur supprimé', type: 'success' })
    } catch {
      setToast({ msg: 'Erreur lors de la suppression', type: 'error' })
    }
    setConfirm(null)
  }

  const filtered = items.filter(u =>
    `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  )

  const isFormValid = form.prenom && form.nom && form.email && form.numero &&
    (editing || form.password)

  return (
    <div>

      {/* HEADER */}
      <div className="page-header">
        <h2>Utilisateurs</h2>
        <p>Gérer les comptes utilisateurs</p>
      </div>

      {/* CARD */}
      <div className="card">

        {/* SEARCH + BUTTON */}
        <div className="search-bar">
          <div className="search-input-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="search-input"
              placeholder="Rechercher un utilisateur..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" onClick={openCreate}>
            <svg width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nouvel utilisateur
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
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Rôle</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state">
                        <p>Aucun utilisateur trouvé</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map(u => {
                    const badge = getRoleBadge(u.roles)
                    return (
                      <tr key={u.id}>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar">
                              {getInitials(u.prenom, u.nom)}
                            </div>
                            <div>
                              <div className="user-name">{u.prenom} {u.nom}</div>
                              <div className="user-sub">#{u.id}</div>
                            </div>
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>{u.numero || '—'}</td>
                        <td>
                          <span className="role-badge"
                            style={{ background: badge.bg, color: badge.color }}>
                            {badge.label}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn-icon" onClick={() => openEdit(u)}>
                              <svg width="14" height="14" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button className="btn-icon danger" onClick={() => setConfirm(u)}>
                              <svg width="14" height="14" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
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
                {editing ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
              </span>
              <button className="btn-icon" onClick={() => setModal(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="form-grid">

              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label className="form-label">Prénom *</label>
                  <input className="form-input" value={form.prenom}
                    onChange={e => setForm({ ...form, prenom: e.target.value })}
                    placeholder="ex: Kouassi" />
                </div>
                <div className="form-group">
                  <label className="form-label">Nom *</label>
                  <input className="form-input" value={form.nom}
                    onChange={e => setForm({ ...form, nom: e.target.value })}
                    placeholder="ex: Diallo" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="utilisateur@example.com" />
              </div>

              <div className="form-group">
                <label className="form-label">Numéro de téléphone *</label>
                <input className="form-input" value={form.numero}
                  onChange={e => setForm({ ...form, numero: e.target.value })}
                  placeholder="ex: +225 07 00 00 00 00" />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Mot de passe {editing && <span style={{ color: 'var(--text2)', fontWeight: 400 }}>(laisser vide = inchangé)</span>}
                  {!editing && ' *'}
                </label>
                <input className="form-input" type="password" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder={editing ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'} />
              </div>

              <div className="form-group">
                <label className="form-label">Rôle</label>
                <select className="form-input"
                  value={form.roles[0] || 'ROLE_USER'}
                  onChange={e => setForm({ ...form, roles: [e.target.value] })}
                >
                  {ROLE_OPTIONS.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>
                Annuler
              </button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={!isFormValid}>
                {editing ? 'Enregistrer' : 'Créer'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CONFIRM */}
      {confirm && (
        <ConfirmDialog
          message={`Supprimer "${confirm.prenom} ${confirm.nom}" ?`}
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