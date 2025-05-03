import { Routes, Route } from 'react-router-dom'
import './App.css'
import UploadFile from './pages/UploadFile.jsx'
import DetailFile from './pages/DetailFile.jsx'

function App() {

  return (
    <Routes>
      <Route path="/" element={<UploadFile />} />
      <Route path="/files/:uuid" element={<DetailFile />} />
    </Routes>
  )
}

export default App
