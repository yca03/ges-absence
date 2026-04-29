import { useRef } from 'react'

const numRecu = (id) => `REC-${String(id).padStart(5, '0')}`

const today = new Date().toLocaleDateString('fr-FR', {
  day: '2-digit', month: 'long', year: 'numeric'
})

export default function RecuInscription({ recu, getFiliereName, onClose }) {

  const recuRef = useRef()

  const handlePrint = () => {
    const contenu = recuRef.current.innerHTML
    const win = window.open('', '_blank', 'width=800,height=600')
    win.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <title>Reçu d'inscription</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', sans-serif;
            background: #fff;
            color: #1e293b;
            padding: 40px;
          }
          .recu-wrap { max-width: 680px; margin: 0 auto; }
        </style>
      </head>
      <body>
        <div class="recu-wrap">${contenu}</div>
      </body>
      </html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 400)
  }

  if (!recu) return null

  return (
    <div className="etu-overlay" onClick={onClose}>
      <div
        className="etu-modal"
        style={{
          maxWidth: 720,
          maxHeight: '90vh',        /* ✅ hauteur max 90% de l'écran */
          display: 'flex',
          flexDirection: 'column',  /* ✅ header / body / footer en colonne */
          overflow: 'hidden'        /* ✅ empêche le modal de déborder */
        }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── Header ── */}
        <div className="etu-header" style={{ flexShrink: 0 }}>
          {/* ✅ flexShrink:0 = le header ne rétrécit jamais */}
          <div className="etu-badge">🖨️ Impression</div>
          <h2 className="etu-title">Reçu d'inscription</h2>
          <p className="etu-subtitle">Aperçu avant impression</p>
          <button className="etu-close" onClick={onClose}>✕</button>
        </div>

        {/* ── Aperçu scrollable ── */}
        <div
          className="etu-body"
          style={{
            background: '#f8fafc',
            padding: '24px 28px',
            flex: 1,              /* ✅ prend tout l'espace disponible */
            overflowY: 'auto'     /* ✅ scroll uniquement dans le body */
          }}
        >
          <div
            ref={recuRef}
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: 32,
              boxShadow: '0 2px 12px rgba(0,0,0,.06)'
            }}
          >

            {/* ── En-tête reçu ── */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              paddingBottom: 20,
              borderBottom: '2px solid #6366f1',
              marginBottom: 24
            }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#6366f1', letterSpacing: '-.02em' }}>
                  🎓 EduSystem
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  Système de gestion scolaire
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                  N° Reçu
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#6366f1' }}>
                  {numRecu(recu.id)}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  Émis le {today}
                </div>
              </div>
            </div>

            {/* ── Bande titre ── */}
            <div style={{
              background: '#eef2ff',
              borderLeft: '4px solid #6366f1',
              padding: '10px 16px',
              borderRadius: '0 8px 8px 0',
              marginBottom: 24
            }}>
              <div style={{
                fontSize: 13, fontWeight: 700, color: '#3730a3',
                textTransform: 'uppercase', letterSpacing: '.06em'
              }}>
                Reçu d'inscription — Année académique {new Date().getFullYear()}
              </div>
            </div>

            {/* ── Label section ── */}
            <div style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '.12em', color: '#94a3b8', marginBottom: 10
            }}>
              Informations de l'étudiant
            </div>

            {/* ── Grille infos ── */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              border: '1px solid #e2e8f0', borderRadius: 10,
              overflow: 'hidden', marginBottom: 24
            }}>
              {[
                { label: 'Prénom',    val: recu.prenom    || '—' },
                { label: 'Nom',       val: recu.nom       || '—' },
                { label: 'Email',     val: recu.email     || '—' },
                { label: 'Téléphone', val: recu.telephone || '—' },
                { label: 'Filière',   val: getFiliereName(recu) },
                { label: 'Sexe',      val: recu.sexe === 'M' ? 'Masculin' : 'Féminin' },
              ].map((row, i, arr) => (
                <div key={i} style={{
                  padding: '12px 16px',
                  borderRight:  (i % 2 === 0) ? '1px solid #e2e8f0' : 'none',
                  borderBottom: (i < arr.length - 2) ? '1px solid #e2e8f0' : 'none'
                }}>
                  <div style={{
                    fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                    letterSpacing: '.08em', color: '#94a3b8', marginBottom: 3
                  }}>
                    {row.label}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                    {row.val}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Statut inscription ── */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: 10, padding: '14px 18px', marginBottom: 32
            }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: '#22c55e', flexShrink: 0
              }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#15803d' }}>
                  Inscription confirmée
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  L'étudiant est bien inscrit dans le système
                </div>
              </div>
            </div>

            {/* ── Signature ── */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
              paddingTop: 20, borderTop: '1px dashed #cbd5e1'
            }}>
              <div style={{ fontSize: 11, color: '#94a3b8', maxWidth: 300 }}>
                Ce document est un reçu officiel d'inscription. Veuillez le conserver précieusement.
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 160, height: 1, background: '#1e293b',
                  margin: '40px auto 6px'
                }} />
                <div style={{ fontSize: 11, color: '#64748b' }}>Signature & Cachet</div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Footer toujours visible ── */}
        <div className="etu-footer" style={{ flexShrink: 0 }}>
          {/* ✅ flexShrink:0 = le footer ne rétrécit jamais, toujours visible */}
          <button className="etu-btn-cancel" onClick={onClose}>
            Fermer
          </button>
          <button className="etu-btn-submit" onClick={handlePrint}>
            🖨️ Imprimer le reçu
          </button>
        </div>

      </div>
    </div>
  )
}