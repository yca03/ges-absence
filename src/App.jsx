import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Sidebar from './components/Sidebar'
import Header from './components/Header'

import Dashboard from './pages/Dashboard'
import Periodes from './pages/PeriodeEval/Periodes'
import Matieres from './pages/Matiere/Matieres'
import Enseignants from './pages/Enseignant/Enseignants'
import Filieres from './pages/Filiere/Filieres'

import Etudiants from './pages/Etudiant/Etudiants'
import Enseignements from './pages/Enseignement/Enseignement'

import Justifications from './pages/Justification/Justifications'
import Presence_absence from './pages/Presence&Abs/Presences'

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout">

        {/* SIDEBAR */}
        <Sidebar />

        {/* PARTIE DROITE */}
        <div className="main">

          {/* HEADER */}
          <Header />

          {/* CONTENU */}
          <div className="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />

              {/* PARAMETRAGE */}
              <Route path="/periodes" element={<Periodes />} />
              <Route path="/matieres" element={<Matieres />} />
              <Route path="/enseignants" element={<Enseignants />} />
              <Route path="/filieres" element={<Filieres />} />


              {/* SAIASIE */}
              <Route path="/etudiants" element={<Etudiants />} />
              <Route path="/enseignements" element={<Enseignements />} />
              <Route path="/presences" element={<Presence_absence />} />
               <Route path="/justifications" element={<Justifications />} />

              {/* REDIRECTION */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

        </div>
      </div>
    </BrowserRouter>
  )
}