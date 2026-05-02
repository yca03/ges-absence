import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Login from './pages/Login'

import Dashboard from './pages/Dashboard'
import Users from './pages/User/User'
import Periodes from './pages/PeriodeEval/Periodes'
import Matieres from './pages/Matiere/Matieres'
import Enseignants from './pages/Enseignant/Enseignants'
import Filieres from './pages/Filiere/Filieres'
import Etudiants from './pages/Etudiant/Etudiants'
import Enseignements from './pages/Enseignement/Enseignement'
import Justifications from './pages/Justification/Justifications'
import Presence_absence from './pages/Presence&Abs/Presences'
import EditionMatieres from './pages/Edition/EditionMatieres'
import EditionAbsences from './pages/Edition/EditionAbsences'
import EditionEtudiants from './pages/Edition/EditionEtudiants'

export default function App() {
  const [user, setUser] = useState(null)

  if (!user) {
    return <Login onLogin={setUser} />
  }

  return (
    <BrowserRouter>
      <div className="layout">
        <Sidebar />
        <div className="main">
          <Header user={user} onLogout={() => setUser(null)} />
          <div className="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/periodes" element={<Periodes />} />
              <Route path="/matieres" element={<Matieres />} />
              <Route path="/enseignants" element={<Enseignants />} />
              <Route path="/filieres" element={<Filieres />} />
              <Route path="/etudiants" element={<Etudiants />} />
              <Route path="/enseignements" element={<Enseignements />} />
              <Route path="/presences" element={<Presence_absence />} />
              <Route path="/justifications" element={<Justifications />} />
              <Route path="/edition/matieres" element={<EditionMatieres />} />
              <Route path="/edition/absences" element={<EditionAbsences />} />
              <Route path="/edition/etudiants" element={<EditionEtudiants />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  )
}