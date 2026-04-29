import { useState } from 'react'
import { useCrud } from '../../services/useCrud'
import { enseignantService } from '../../services/api'
import Toast from '../../components/Toast'
import ConfirmDialog from '../../components/ConfirmDialog'

const EMPTY = {
  nom: '',
  prenom: '',
  email: '', 
  specialite: '',
  diplome: '',
  sexe: 'M'
}

export default function Enseignants() {
  const { items, loading, create, update, remove } = useCrud(enseignantService)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [toast, setToast] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [search, setSearch] = useState('')

  const openCreate = () => { setForm(EMPTY); setEditing(null); setModal(true) }
  const openEdit = (e) => {
    setForm({ nom: e.nom || '', prenom: e.prenom || '', mail: e.email || '', specialite: e.specialite || '', diplome: e.diplome || '', sexe: e.sexe || 'M' })
    setEditing(e); setModal(true)
  }

  const handleSubmit = async () => {
    try {
      if (editing) await update(editing.id, form)
      else await create(form)
      setModal(false)
      setToast({ msg: editing ? 'Enseignant modifié !' : 'Enseignant créé !', type: 'success' })
    } catch { setToast({ msg: 'Erreur lors de l\'enregistrement', type: 'error' }) }
  }

  const handleDelete = async (id) => {
    try { await remove(id); setToast({ msg: 'Enseignant supprimé', type: 'success' }) }
    catch { setToast({ msg: 'Erreur lors de la suppression', type: 'error' }) }
    setConfirm(null)
  }

  const filtered = items.filter(e =>
    `${e.nom} ${e.prenom}`.toLowerCase().includes(search.toLowerCase()) ||
    (e.specialite || '').toLowerCase().includes(search.toLowerCase())
  )

  const initials = (e) => `${(e.prenom || '')[0] || ''}${(e.nom || '')[0] || ''}`.toUpperCase()
  const colors = ['#76f74f', '#7c5af7', '#22c55e', '#e4ae79', '#f35656', '#06b6d4']
  const colorFor = (e) => colors[(e.id || 0) % colors.length]

  return (
    <div>
      <div className="page-header">
        <h2>Enseignants</h2>
        <p>Gérer les profils des enseignants de l'établissement</p>
      </div>

      <div className="card">
        <div className="search-bar">
          <div className="search-input-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input className="search-input" placeholder="Rechercher un enseignant..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nouvel enseignant
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>Chargement...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Enseignant</th>
                  <th>Email</th>
                  <th>Spécialité</th>
                  <th>Diplôme</th>
                  <th>Sexe</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty-state"><p>Aucun enseignant trouvé</p></div></td></tr>
                ) : filtered.map(e => (
                  <tr key={e.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${colorFor(e)}22`, color: colorFor(e), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.78rem', flexShrink: 0 }}>
                          {initials(e)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.88rem' }}>{e.prenom} {e.nom}</div>
                        </div>
                      </div>
                    </td>
                    <td>{e.email || '—'}</td>
                    <td>{e.specialite || '—'}</td>
                    <td>{e.diplome || '—'}</td>
                    <td><span className={`badge ${e.sexe === 'F' ? 'badge-yellow' : 'badge-blue'}`}>{e.sexe === 'F' ? 'Féminin' : 'Masculin'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-icon" onClick={() => openEdit(e)} title="Modifier">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button className="btn-icon danger" onClick={() => setConfirm(e)} title="Supprimer">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
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

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Modifier l\'enseignant' : 'Nouvel enseignant'}</span>
              <button className="btn-icon" onClick={() => setModal(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="form-grid">
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label className="form-label">Prénom *</label>
                  <input className="form-input" placeholder="Jean" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Nom *</label>
                  <input className="form-input" placeholder="Dupont" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" placeholder="jean.dupont@univ.fr" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label className="form-label">Spécialité</label>
                  <input className="form-input" placeholder="Informatique" value={form.specialite} onChange={e => setForm({ ...form, specialite: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Diplôme</label>
                  <input className="form-input" placeholder="Doctorat, Master..." value={form.diplome} onChange={e => setForm({ ...form, diplome: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Sexe</label>
                <div className="radio-group">
                  {[{ v: 'M', l: 'Masculin' }, { v: 'F', l: 'Féminin' }].map(opt => (
                    <div key={opt.v} className={`radio-option ${form.sexe === opt.v ? 'selected' : ''}`} onClick={() => setForm({ ...form, sexe: opt.v })}>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${form.sexe === opt.v ? 'var(--accent)' : 'var(--border)'}`, background: form.sexe === opt.v ? 'var(--accent)' : 'transparent' }} />
                      {opt.l}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={!form.nom || !form.prenom}>
                {editing ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirm && <ConfirmDialog message={`Supprimer l'enseignant "${confirm.prenom} ${confirm.nom}" ?`} onConfirm={() => handleDelete(confirm.id)} onCancel={() => setConfirm(null)} />}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
